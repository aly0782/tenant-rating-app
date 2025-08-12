#!/usr/bin/expect -f

set timeout 60

spawn yarn blueprint run deployREITxFactory --testnet

# Wait for wallet selection
expect "Which wallet are you using?"

# Send down arrow 3 times to select Mnemonic (4th option)
send "\033\[B"
send "\033\[B"
send "\033\[B"

# Press Enter to select Mnemonic
send "\r"

# Interact with the rest of the process
interact