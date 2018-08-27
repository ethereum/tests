#!/bin/bash
onexit() 
{ 
    kill $child 
}
trap onexit SIGTERM
trap onexit SIGABRT

##ARGUMENTS PASSED BY RETESTETH
##
## $1  <db-path> 		A path to database directory that a client should use
## $2  <ipcpath>		A path to the ipc socket file (has /geth.ipc at the end)
#####

eth --test --db-path $1 --ipcpath $2 --log-verbosity 5 &
child=$! 
wait "$child"
