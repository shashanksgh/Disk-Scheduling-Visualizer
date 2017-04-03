var anim_time = 0;
var anim_paused = true;
var anim_data = null;
var anim_min_canvas_height = 480;

var anim_track_size, anim_track_start, anim_seek_queue;

// TODO: better colors!
var anim_colors = [
    'red',
    'orange',
    'yellow',
    'green',
    'blue',
    'indigo',
    'violet'
];

function animSetup(config) {
    anim_track_size = config.trackSize;
    anim_track_start = config.trackStart;
    anim_track_direction = config.direction;
    anim_seek_queue = config.seekQueue;
	
    anim_data = [];
    
    var color_index = 0;
    for (var i in config.algorithms) {
        var algo_id = config.algorithms[i];
        
		var algo_info = algos[algo_id];
		
        var processed_queue = algo_info.func(anim_track_start, anim_track_size, anim_track_direction, anim_seek_queue);
        if (processed_queue != null) {
            anim_data.push({
                id: algo_id,
                info: algo_info,
                queue: processed_queue,
                color: anim_colors[color_index++]
            });  
        }
    }
}

function animStart(config) {
    animReset();
    animSetup(config);
    animSetPaused(false);
}

function animSetTime(time) {
    anim_time = time;
}

function animSetPaused(paused) {
    anim_paused = paused;
}

function animReset() {
    animSetTime(0);
    animSetPaused(true);
    //anim_data = null;
}

function animUpdate(cur_time_ms) {
    var w = animCanvas.width;
    var h = animCanvas.height;
    var cur_time = cur_time_ms / 1000;

    var dt = null;
    if (last_time) {
        dt = cur_time - last_time;
    } else {
        dt = 1 / 60;
    }

    context.clearRect(0, 0, w, h);

    render(anim_time, dt, w, h);

    if (!anim_paused) {
        anim_time += dt;
    }
    
    last_time = cur_time;

    window.requestAnimationFrame(animUpdate);
}

//
//
//
function render(t, dt, canvas_width, canvas_height) {
    context.font = "9px Courier New";
    
    var draw_tasks = [];
	
    var radius_initial = 4;
    var padding = 20;
    var line_y = padding * 3;
    var new_canvas_height = 480;
    var segment_width = (canvas_width - 2 * padding) / (anim_track_size - 1);
	
	pushStyle(draw_tasks, 'black');
	
	pushRect(draw_tasks, 0, 0, canvas_width, canvas_height);
	
	// draw frametime counter
	pushTextAlign(draw_tasks, 'left');
	pushTextBaseline(draw_tasks, 'top');
	pushText(draw_tasks, round(dt * 1000, 2) + "ms", 0, 0);
	
	// draw main track line
    pushLine(draw_tasks, padding, line_y, canvas_width - padding, line_y);
	
	var legend_x = padding;
	var legend_y = padding;
	
    pushTextBaseline(draw_tasks, 'middle');
	
	for (var i in anim_data) {
		var algo_data = anim_data[i];
		
		pushStyle(draw_tasks, algo_data.color);
		pushRect(draw_tasks, legend_x, legend_y, 8, 8, 'fill');
		
		legend_x += 8 + 4;
		
		pushStyle(draw_tasks, 'black');
		pushText(draw_tasks, algo_data.info.short_name, legend_x, legend_y + 4);
		
		// HACK: this depends on a properly configured context (which we're now mostly doing with draw_tasks)
		var text_measure = context.measureText(algo_data.info.short_name);
		
		legend_x += text_measure.width + 32;
	}
	
    pushTextAlign(draw_tasks, 'center');
	pushTextBaseline(draw_tasks, 'bottom');
	
    for (var track_index = 0; track_index < anim_track_size; track_index++) {
        var notch_x = padding + track_index * segment_width;
		
		var is_in_queue = false;
		for (var i in anim_seek_queue) {
			if (anim_seek_queue[i].pos == track_index) {
				is_in_queue = true;
				break;
			}
		}
		
		// draw index for relevant track positions
		if (track_index == 0 || track_index == (anim_track_size - 1) || is_in_queue) {
			pushText(draw_tasks, track_index.toString(), notch_x, line_y - padding / 2 - 2);
		}
		
		// draw track notch
		pushLine(draw_tasks, notch_x, line_y - padding / 2, notch_x, line_y + padding / 2);
    }
	
	var start_x = padding + anim_track_start * segment_width;
	
	// draw track start
	pushCircle(draw_tasks, start_x, line_y, radius_initial);
	
    for (var algo_index in anim_data) {
        var node_y = line_y;
        
        var prev_node_pos = anim_track_start;
        
        var prev_x = start_x;
        var prev_y = line_y;
            
        var radius_incr = 2;
        var radius = radius_initial;
        
        var algo_data = anim_data[algo_index];
            
        for (var i in algo_data.queue) {
            var pos = algo_data.queue[i].pos;
            
            // TODO: make sure this fits into canvas_height?
            node_y += 0.125 * segment_width * Math.abs(pos - prev_node_pos);
            
            if (node_y > new_canvas_height) {
				new_canvas_height = node_y;
			}
            
            if (prev_node_pos == pos) {
                radius += radius_incr;
            }
            else {
                radius = radius_initial;
            }
            
            var node_x = padding + pos * segment_width;
            
			pushStyle(draw_tasks, algo_data.color);
			pushLine(draw_tasks, prev_x, prev_y, node_x, node_y);
			pushCircle(draw_tasks, node_x, node_y, radius);

            prev_node_pos = pos;
            
            prev_x = node_x;
            prev_y = node_y;
        }
    }
    
    if (new_canvas_height > anim_min_canvas_height) {
        animCanvas.height = new_canvas_height + 50;
    }
	
	for (var i in draw_tasks) {
		var task = draw_tasks[i];
		
		switch (task.type) {
			case 'style': {
				context.strokeStyle = task.style;
				context.fillStyle = task.style;
				
				break;
			}
			
			case 'text': {
				context.fillText(task.text, task.x, task.y);
				
				break;
			}
			
			case 'align': {
				context.textAlign = task.align;
				
				break;
			}
			
			case 'baseline': {
				context.textBaseline = task.baseline;
				
				break;
			}
			
			case 'circle': {
				context.beginPath();
				context.ellipse(task.x, task.y, task.radius, task.radius, 0, 0, 2 * Math.PI);
				
				if (task.mode == 'fill') {
					context.fill();
				}
				else {
					context.stroke();
				}
				
				break;
			}
			
			case 'line': {
				context.beginPath();
				context.moveTo(task.ax, task.ay);
				context.lineTo(task.bx, task.by);
	
				if (task.mode == 'fill') {
					context.fill();
				}
				else {
					context.stroke();
				}
				
				break;
			}
			
			case 'rect': {
				if (task.mode == 'fill') {
					context.fillRect(task.x, task.y, task.w, task.h);
				}
				else {
					context.strokeRect(task.x, task.y, task.w, task.h);
				}
				
				break;
			}
		}
	}
}

function pushStyle(draw_tasks, style) {
	draw_tasks.push({
		type: 'style',
		style: style
	});
}

function pushText(draw_tasks, text, x, y) {
	draw_tasks.push({
		type: 'text',
		x: x,
		y: y,
		text: text
	});
}

function pushTextAlign(draw_tasks, align) {
	draw_tasks.push({
		type: 'align',
		align: align
	});
}

function pushTextBaseline(draw_tasks, baseline) {
	draw_tasks.push({
		type: 'baseline',
		baseline: baseline
	});
}

function pushCircle(draw_tasks, x, y, radius, mode) {
	draw_tasks.push({
		type: 'circle',
		mode: mode,
		x: x,
		y: y,
		radius: radius
	});
}

function pushLine(draw_tasks, ax, ay, bx, by) {
	draw_tasks.push({
		type: 'line',
		ax: ax,
		ay: ay,
		bx: bx,
		by: by
	});
}

function pushRect(draw_tasks, x, y, w, h, mode) {
	draw_tasks.push({
		type: 'rect',
		mode: mode,
		x: x,
		y: y,
		w: w,
		h: h
	});
}