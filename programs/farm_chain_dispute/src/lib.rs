use anchor_lang::prelude::*;

pub mod state;
pub mod instructions;
pub mod error;

use instructions::*;

declare_id!("Dispute11111111111111111111111111111111111");

#[program]
pub mod farm_chain_dispute {
    use super::*;

    pub fn initialize_reputation(ctx: Context<InitializeReputation>) -> Result<()> {
        instructions::initialize_reputation(ctx)
    }

    pub fn trigger_dispute(ctx: Context<TriggerDispute>, batch_id: u64, reason: String) -> Result<()> {
        instructions::trigger_dispute(ctx, batch_id, reason)
    }

    pub fn resolve_dispute(ctx: Context<ResolveDispute>, frs_drop: u64, current_performance: u64) -> Result<()> {
        instructions::resolve_dispute(ctx, frs_drop, current_performance)
    }
}