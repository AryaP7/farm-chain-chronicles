use anchor_lang::prelude::*;
use crate::state::*;
use crate::error::*;

#[derive(Accounts)]
#[instruction(batch_id: u64)]
pub struct TriggerDispute<'info> {
    #[account(
        init,
        payer = authority,
        space = Dispute::LEN,
        seeds = [b"dispute", batch_id.to_le_bytes().as_ref()],
        bump
    )]
    pub dispute: Account<'info, Dispute>,
    #[account(mut)]
    pub authority: Signer<'info>,
    /// CHECK: The transporter being disputed
    pub transporter: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

pub fn trigger_dispute(ctx: Context<TriggerDispute>, batch_id: u64, reason: String) -> Result<()> {
    let dispute = &mut ctx.accounts.dispute;
    let clock = Clock::get()?;
    
    dispute.batch_id = batch_id;
    dispute.transporter = ctx.accounts.transporter.key();
    dispute.reason = reason;
    dispute.dispute_start_time = clock.unix_timestamp;
    dispute.escrow_amount = 0; // In real integration, we CPI to Token Program to pull SPL out of escrow
    dispute.is_resolved = false;
    
    Ok(())
}

#[derive(Accounts)]
pub struct ResolveDispute<'info> {
    #[account(mut)]
    pub dispute: Account<'info, Dispute>,
    #[account(
        mut,
        seeds = [b"reputation", dispute.transporter.key().as_ref()],
        bump
    )]
    pub reputation_profile: Account<'info, ReputationProfile>,
}

pub fn resolve_dispute(ctx: Context<ResolveDispute>, frs_drop: u64, current_performance: u64) -> Result<()> {
    let dispute = &mut ctx.accounts.dispute;
    let reputation_profile = &mut ctx.accounts.reputation_profile;
    let clock = Clock::get()?;

    require!(!dispute.is_resolved, DisputeError::AlreadyResolved);

    // 48 hours = 48 * 60 * 60 = 172,800 seconds
    let time_passed = clock.unix_timestamp.checked_sub(dispute.dispute_start_time)
        .ok_or(DisputeError::MathOverflow)?;
        
    require!(time_passed >= 172_800, DisputeError::EvidenceWindowNotClosed);

    if frs_drop > 5 {
        // Weighted Moving Average Reputation Math:
        // R_new = (R_old * 0.8) + (Current_Performance * 0.2)
        // Avoid floats by multiplying everything by 10 then reducing
        
        let old_score = reputation_profile.score;
        let weighted_old = old_score.checked_mul(80).ok_or(DisputeError::MathOverflow)?;
        let weighted_new = current_performance.checked_mul(20).ok_or(DisputeError::MathOverflow)?;
        
        let raw_new_score = weighted_old.checked_add(weighted_new).ok_or(DisputeError::MathOverflow)?;
        reputation_profile.score = raw_new_score.checked_div(100).ok_or(DisputeError::MathOverflow)?;
    }

    dispute.is_resolved = true;
    reputation_profile.total_trips = reputation_profile.total_trips.checked_add(1).unwrap();

    Ok(())
}

#[derive(Accounts)]
pub struct InitializeReputation<'info> {
    #[account(
        init,
        payer = authority,
        space = ReputationProfile::LEN,
        seeds = [b"reputation", transporter.key().as_ref()],
        bump
    )]
    pub reputation_profile: Account<'info, ReputationProfile>,
    #[account(mut)]
    pub authority: Signer<'info>,
    /// CHECK: Target transporter actor
    pub transporter: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

pub fn initialize_reputation(ctx: Context<InitializeReputation>) -> Result<()> {
    let profile = &mut ctx.accounts.reputation_profile;
    profile.actor = ctx.accounts.transporter.key();
    profile.score = 100; // Perfect starting score
    profile.total_trips = 0;
    Ok(())
}