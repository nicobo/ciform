#!/bin/sh
#set -vx
# Starts Firefox minimized to execute the tests in the background
# TODO ? start and stop the server before running the navigators to gather tests ?
kstart --iconify --keepbelow firefox -safe-mode -new-window $*
#ps --no-headers --ppid $$ -o pid
#trap "pkill -P $$;exit" INT TERM EXIT
#while [ true ]
#do
#	sleep 1	# waiting for a signal
#done
