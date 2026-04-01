use anchor_lang::prelude::*;

#[error_code]
pub enum DisputeError {
    #[msg("Evidence window of 48 hours has not yet passed.")]
    EvidenceWindowNotClosed,
    #[msg("Dispute is already resolved.")]
    AlreadyResolved,
    #[msg("Reputation math overflow.")]
    MathOverflow,
}