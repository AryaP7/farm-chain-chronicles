use anchor_lang::prelude::*;

#[account]
pub struct Dispute {
    pub batch_id: u64,
    pub transporter: Pubkey,
    pub reason: String,
    pub dispute_start_time: i64,
    pub escrow_amount: u64,
    pub is_resolved: bool,
}

impl Dispute {
    // 8 discriminator + 8 u64 + 32 pubkey + 4 string length + 64 string chars + 8 i64 + 8 u64 + 1 bool = 133
    pub const LEN: usize = 8 + 8 + 32 + 4 + 64 + 8 + 8 + 1;
}

#[account]
pub struct ReputationProfile {
    pub actor: Pubkey,
    pub score: u64, // Managed mathematically (0-100 base scaling)
    pub total_trips: u64,
}

impl ReputationProfile {
    pub const LEN: usize = 8 + 32 + 8 + 8;
}