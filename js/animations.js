var anim_time = 0;
var anim_paused = true;
var anim_data = null;
var anim_min_canvas_height = 480;

var anim_track_size, anim_track_start;

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
    
    anim_data = [];
    
    var color_index = 0;
    for (var algo_id in algos) {
        var algo_info = algos[algo_id];
        
        var processed_queue = algo_info.func(anim_track_start, anim_track_size, anim_track_direction, config.seekQueue);
        if (processed_queue != null) {
            var algo_data = {
                id: algo_id,
                info: algo_info,
                queue: processed_queue,
                color: anim_colors[color_index++]
            };
            
            anim_data.push(algo_data);  
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
    anim_data = null;
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
    context.strokeStyle = "black";
    context.fillStyle = "black";
    context.textBaseline = "top";
    
    var radius_initial = 4;
    var padding = 20;
    var line_y = padding * 3 / 2;
    var start_x = 0;
    var draw_tasks = [];
    var new_canvas_height = 480;
    var segment_width = (canvas_width - 2 * padding) / (anim_track_size - 1);
    
    // Calculate track draw tasks
    for (var track_index = 0; track_index < anim_track_size; track_index++) {
        var notch_x = padding + track_index * segment_width;
        
        // TODO: draw text for each notch?

        //drawLine(notch_x, line_y - padding / 2, notch_x, line_y + padding / 2);
        
        if (track_index == anim_track_start) {
            drawCircle(notch_x, line_y, radius_initial);
            start_x = notch_x;
            
            draw_tasks.push({
                "color": "black",
                "line": [notch_x, line_y - padding / 2, notch_x, line_y + padding / 2],
                "circle": [notch_x, line_y, radius_initial],
            });
        } else {
            draw_tasks.push({
                "color": "black",
                "line": [notch_x, line_y - padding / 2, notch_x, line_y + padding / 2],
                "circle": [],
            });
        }
    }

    // Calculate graph point and line draw tasks 
    for (var algo_index in anim_data) {
        var node_y = line_y;
        
        var prev_node_pos = anim_track_start;
        
        var prev_x = start_x;
        var prev_y = line_y;
            
        var radius_incr = 2;
        var radius = radius_initial;
        
        var algo_data = anim_data[algo_index];
        
        // TODO: calculate entire path in animSetup?
            
        for (var i in algo_data.queue) {
            var pos = algo_data.queue[i].pos;
            
            // TODO: make sure this fits into canvas_height?
            node_y += 0.25 * segment_width * Math.abs(pos - prev_node_pos);
            
            // Increase new canvas height if node_y goes past it
            if (node_y > new_canvas_height)
                new_canvas_height = node_y;
            
            if (prev_node_pos == pos) {
                radius += radius_incr;
            }
            else {
                radius = radius_initial;
            }
            
            // TODO: move this x calculation to a separate function
            var node_x = padding + pos * segment_width;
            
            // Add draw task for drawing phase
            draw_tasks.push({
                "color": algo_data.color,
                "line": [prev_x, prev_y, node_x, node_y],
                "circle": [node_x, node_y, radius],
            });
            
            //context.strokeStyle = algo_data.color;
            //drawLine(prev_x, prev_y, node_x, node_y);
            //drawCircle(node_x, node_y, radius);
            
            prev_node_pos = pos;
            
            prev_x = node_x;
            prev_y = node_y;
        }
    }
    
    // Update canvas height if needed
    if (new_canvas_height > anim_min_canvas_height)
        animCanvas.height = new_canvas_height + 50; // Add some bottom padding
    
    // Execute drawing tasks
    context.strokeRect(0, 0, canvas_width, canvas_height);
    drawLine(padding, line_y, canvas_width - padding, line_y);
    
    for (var task_index = 0; task_index < draw_tasks.length; task_index++) {
        context.strokeStyle = draw_tasks[task_index].color;
        
        if (draw_tasks[task_index].line.length > 0)
            drawLine(draw_tasks[task_index].line[0], draw_tasks[task_index].line[1], draw_tasks[task_index].line[2], draw_tasks[task_index].line[3]);
        if (draw_tasks[task_index].circle.length > 0)
            drawCircle(draw_tasks[task_index].circle[0], draw_tasks[task_index].circle[1], draw_tasks[task_index].circle[2]);
    }
    
    context.font = "9px Courier New";
    context.fillText(round(dt * 1000, 2) + "ms", 0, 0);
}

function drawCircle(x, y, radius) {
    context.beginPath();
    context.ellipse(x, y, radius, radius, 0, 0, 2 * Math.PI);
    context.stroke();
}

function drawLine(ax, ay, bx, by) {
    context.beginPath();
    context.moveTo(ax, ay);
    context.lineTo(bx, by);
    context.stroke();
}