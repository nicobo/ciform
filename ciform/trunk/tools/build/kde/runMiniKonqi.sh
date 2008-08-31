#!/bin/sh
#set -vx
# Starts Konqueror minimized to execute the tests in the background
# TODO ? start and stop the server before running the navigators to gather tests ?
kstart --iconify --keepbelow konqueror $*
#trap "pkill -P $$;exit" INT TERM EXIT
#while [ true ]
#do
#	sleep 1	# waiting for a signal
#done
