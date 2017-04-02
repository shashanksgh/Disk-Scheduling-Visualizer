function fcfs(arr) {
	var result = arr.slice();
	return result;
}

function sstf(start, direction, arr) {
    var result = [];
    var ordered = arr.slice();
    ordered.sort(function (a, b) {
        return a.pos - b.pos;
    });
    var i=0;
    for (var index in arr) {
        if (start<ordered[index].pos)
        {
            break;
        }
        i++;
    }
    var prev = start;
    while (ordered.length!=0) {
        if (i<=0) {
            result.push(ordered[0]);
            ordered.splice(0,1);
        }
        else if (i>=ordered.length) {
            result.push(ordered[ordered.length-1]);
            ordered.splice(ordered.length-1,1);
            i--;
        }
        else if ((prev-ordered[i-1].pos)<=(ordered[i].pos-prev-direction)) {
            result.push(ordered[i-1]);
            prev = ordered[i-1].pos;
            ordered.splice(i-1,1);
            i--;
        }
        else {
            result.push(ordered[i]);
            prev = ordered[i].pos;
            ordered.splice(i,1);
        }
    }
    return result;
}

function scan(start, size, direction, arr) {
    var result = [];
    var ordered = arr.slice();
    ordered.sort(function (a, b) {
        return a.pos - b.pos;
    });
    var i=0;
    for (var index in arr) {
        if (start<ordered[index].pos+(0.1*(direction)))
        {
            break;
        }
        i++;
    }
    i+=direction;
    var prev = start;
    while (ordered.length!=0) {
        if (i<=0) {
            if (i==0) {
                result.push({
                    "index": -1,
                    "pos": 0
                })
                i--;
            }
            else {
                result.push(ordered[0]);
                ordered.splice(0,1);
            }
        }
        else if (i>=ordered.length) {
            if (i!=ordered.length+1) {
                result.push(ordered[ordered.length-1]);
                ordered.splice(ordered.length-1,1);
				if (!direction) i--;
            }
            else {
                result.push({
                    "index": -1,
                    "pos": size-1
                })
                i++;
            }
        }
        else { //if ((prev-ordered[i-1].pos)<(ordered[i].pos-prev)) 
            result.push(ordered[i-1]);
            prev = ordered[i-1].pos;
            ordered.splice(i-1,1);
            i += direction-1;
        }
/*        else {
            result.push(ordered[i]);
            prev = ordered[i].pos;
            ordered.splice(i,1);
        }*/
    }
    return result;
}

function cscan(start, size, direction, arr) {
    var result = [];
    var ordered = arr.slice();
    ordered.sort(function (a, b) {
        return a.pos - b.pos;
    });
    var i=0;
    for (var index in arr) {
        if (start<ordered[index].pos+(0.1*(direction)))
        {
            break;
        }
        i++;
    }
    i+=direction;
    var prev = start;
    while (ordered.length!=0) {
        if (i<=0) {
            if (i==0) {
                result.push({
                    "index": -1,
                    "pos": 0
                })
                if (!direction) i=ordered.length+1; else i--;
            }
            else {
                result.push(ordered[0]);
                ordered.splice(0,1);
            }
        }
        else if (i>=ordered.length) {
            if (i!=ordered.length+1) {
                result.push(ordered[ordered.length-1]);
                ordered.splice(ordered.length-1,1);
				if (!direction) i--;
            }
            else {
                result.push({
                    "index": -1,
                    "pos": size-1
                })
                if (direction) i=0; else i++;
            }
        }
        else { //if ((prev-ordered[i-1].pos)<(ordered[i].pos-prev)) 
            result.push(ordered[i-1]);
            prev = ordered[i-1].pos;
            ordered.splice(i-1,1);
            i += direction-1;
        }
/*        else {
            result.push(ordered[i]);
            prev = ordered[i].pos;
            ordered.splice(i,1);
        }*/
    }
    return result;
}

function look(start, size, direction, arr) {
    var result = [];
    var ordered = arr.slice();
    ordered.sort(function (a, b) {
        return a.pos - b.pos;
    });
    var i=0;
    for (var index in arr) {
        if (start<ordered[index].pos+(0.1*(direction)))
        {
            break;
        }
        i++;
    }
    i+=direction;
    var prev = start;
    while (ordered.length!=0) {
        if (i<=0) {
            result.push(ordered[0]);
            ordered.splice(0,1);
        }
        else if (i>=ordered.length) {
            result.push(ordered[ordered.length-1]);
            ordered.splice(ordered.length-1,1);
        }
        else { //if ((prev-ordered[i-1].pos)<(ordered[i].pos-prev)) 
            result.push(ordered[i-1]);
            prev = ordered[i-1].pos;
            ordered.splice(i-1,1);
            i += direction-1;
        }
/*        else {
            result.push(ordered[i]);
            prev = ordered[i].pos;
            ordered.splice(i,1);
        }*/
    }
    return result;
}

function clook(start, size, direction, arr) {
    var result = [];
    var ordered = arr.slice();
    ordered.sort(function (a, b) {
        return a.pos - b.pos;
    });
    var i=0;
    for (var index in arr) {
        if (start<(ordered[index].pos+0.1*(direction)))
        {
            break;
        }
        i++;
    }
    i+=direction;
    var prev = start;
    while (ordered.length!=0) {
        if (i<=0) {
            if (i==0) {
                if (!direction) i=ordered.length+1; else i--;
            }
            else {
                result.push(ordered[0]);
                ordered.splice(0,1);
            }
        }
        else if (i>=ordered.length) {
            if (i!=ordered.length+1) {
                result.push(ordered[ordered.length-1]);
                ordered.splice(ordered.length-1,1);
            }
            else {
                 if (direction) i=0; else i++;
            }
        }
        else { //if ((prev-ordered[i-1].pos)<(ordered[i].pos-prev)) 
            result.push(ordered[i-1]);
            prev = ordered[i-1].pos;
            ordered.splice(i-1,1);
            i += direction-1;
        }
/*        else {
            result.push(ordered[i]);
            prev = ordered[i].pos;
            ordered.splice(i,1);
        }*/
    }
    return result;
}

var algos = {
	fcfs: {
		name: 'First Come-First Serve (FCFS)',
		func: function (track_start, track_size, track_direction, seek_queue) {
			var result = fcfs(seek_queue);
			return result;
		}
	},
	
	/*dummy: {
		name: 'Really dumb algo',
		func: function (track_start, track_size, track_direction, seek_queue) {
			var result = yolo_copy(seek_queue);
			result.sort(function (a, b) {
				return a.pos - b.pos;
			});
			return result;
		}
	},*/
	
	sstf: {
		name: 'Shortest Seek Time First (SSTF)',
		func: function (track_start, track_size, track_direction, seek_queue) {
			var result = sstf(track_start, track_direction, seek_queue);
            return result;
		}
	},
	
	scan: {
		name: 'Elevator (SCAN)',
		func: function (track_start, track_size, track_direction, seek_queue) {
			var result = scan(track_start, track_size, track_direction, seek_queue);
            return result;
		}
	},
	
	cscan: {
		name: 'Circular SCAN (C-SCAN)',
		func: function (track_start, track_size, track_direction, seek_queue) {
			var result = cscan(track_start, track_size, track_direction, seek_queue);
            return result;
		}
	},
	
	look: {
		name: 'LOOK',
		func: function (track_start, track_size, track_direction, seek_queue) {
			var result = look(track_start, track_size, track_direction, seek_queue);
            return result;
		}
	},
	
	clook: {
		name: 'C-LOOK',
		func: function (track_start, track_size, track_direction, seek_queue) {
			var result = clook(track_start, track_size, track_direction, seek_queue);
            return result;
		}
	}
};