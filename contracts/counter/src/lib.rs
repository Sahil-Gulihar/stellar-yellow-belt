#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Env, Symbol};

const COUNTER: Symbol = symbol_short!("COUNTER");

#[contract]
pub struct CounterContract;

#[contractimpl]
impl CounterContract {
    /// Increment the counter and return the new value.
    pub fn increment(env: Env) -> u32 {
        let mut count: u32 = env.storage().persistent().get(&COUNTER).unwrap_or(0);
        count += 1;
        env.storage().persistent().set(&COUNTER, &count);
        
        // Emit an event for real-time synchronization
        env.events().publish((symbol_short!("counter"), symbol_short!("increment")), count);
        
        count
    }

    /// Get the current value of the counter.
    pub fn get_count(env: Env) -> u32 {
        env.storage().persistent().get(&COUNTER).unwrap_or(0)
    }
}
