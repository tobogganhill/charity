
#! /bin/bash

# output=$(nc -z localhost 8545; echo $?)
output=$(nc -z localhost 7545; echo $?)
[ $output -eq "0" ] && trpc_running=true
if [ ! $trpc_running ]; then
  echo "Starting ganache node instance"
  # create 100 accounts for load tests
  yarn run ganache-cli -a 100 -i 3 \
  > /dev/null &
  trpc_pid=$!
fi
truffle test "$@"
if [ ! $trpc_running ]; then
  kill -9 $trpc_pid
fi
