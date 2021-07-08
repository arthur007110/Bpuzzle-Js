//Desenvolvido por Arthur C. Gomes
//Github: https://github.com/arthur007110

//Elements References
var game_grid = document.getElementById("game-grid");
var points_label = document.getElementById("points-label");
var points_text_label = document.getElementById("points-text");

//Game Config
var game_speed = 50;
var cells_quantity = 625;
var cell_size = 22;
var cells_per_grid_side = Math.sqrt(cells_quantity);
var time_move_blocks = 5;
var time_move_blocks_now = time_move_blocks;
var cursor_distance_factor = 0.35;

//Game Logic
var player_position = {x: 0, y: 0};

var shoot_position = null;

var player_color = "blue";
var shoot_color = "";

var points = 0;

var player_shoot = false;
var player_shoot_dir = 2;
var shoot_dir = 0;

var blocks = [{x: 0, y: 0, color: "red"}];
var blocks_dir = "D";
var update_blocks_in = time_move_blocks_now;

var level = 1;
var blocks_per_level = 30;

//Game Create
function create(){
    
    game_grid.style.width = (cells_per_grid_side * cell_size) + "px";
    game_grid.style.height = (cells_per_grid_side * cell_size) + "px";
    game_grid.addEventListener("click", function(){window.open("https://github.com/arthur007110");});

    points_label.style.width = Math.floor((cells_per_grid_side * cell_size)/5) + "px";
    points_label.style.height = (cells_per_grid_side * cell_size) + "px";
    points_label.addEventListener("click", function(){window.open("https://github.com/arthur007110");});

    player_position = {x: Math.floor(cells_per_grid_side/2), y: Math.floor(cells_per_grid_side/2)}

    player_color = get_color();

    player_input();
    create_blocks();
}

//Game Loop
function update(){

    clear_display();
    finish_level();
    move_blocks();
    move_shoot();
    shoot_collision();
    draw_player();
    draw_cursor();
    draw_blocks();
    draw_shoot();
    shoot();
    update_points();

    player_input_this_frame = false;
}

function shoot(){

    if(!player_shoot){
        return;
    }
    player_shoot = false;

    shoot_position = {x: player_position.x, y: player_position.y};

    shoot_dir = player_shoot_dir;

    shoot_color = player_color;

    player_color = get_player_color();
}

function move_shoot(){

    if(shoot_position == null){
        return;
    }

    switch(shoot_dir){
        case 1:
            shoot_position.y--;
            break;
        case 2:
            shoot_position.x--;
            break;
        case 3:
            shoot_position.y++;
            break;
        case 4:
            shoot_position.x++;
            break;
    }
}

function shoot_collision(){

    if(shoot_position == null){
        return;
    }

    if(shoot_position.x < 0){
        shoot_position = null;
    }else if(shoot_position.x > cells_per_grid_side-1){
        shoot_position = null;
    }else if(shoot_position.y < 0){
        shoot_position = null;
    }else if(shoot_position.y > cells_per_grid_side-1){
        shoot_position = null;
    }else{
        for(var i = 0; i< blocks.length; i++){
            if(shoot_position != null){
                if(shoot_position.x == blocks[i].x && shoot_position.y == blocks[i].y){
                    destroy_blocks(i, shoot_color);
                    shoot_position = null;
                }
            }
        }
    }
}

function destroy_blocks(index_to_destroy, color_to_destroy){

    let blocks_to_destroy = [];

    if(blocks[index_to_destroy].color != color_to_destroy){
        return;
    }

    blocks_to_destroy.push(index_to_destroy);

    for(let i = index_to_destroy-1; i >= 0; i--){
        if(blocks[i].color == color_to_destroy){
            blocks_to_destroy.push(i);
        }else{
            break;
        }
    }

    for(let i = index_to_destroy+1; i < blocks.length; i++){
        if(blocks[i].color == color_to_destroy){
            blocks_to_destroy.push(i);
        }else{
            break;
        }
    }

    let first_block_to_destroy_index = blocks.length;
    let last_block_to_destroy_index = 0;

    for(let i = 0; i < blocks_to_destroy.length; i++){
        if(blocks_to_destroy[i] < first_block_to_destroy_index){
            first_block_to_destroy_index = blocks_to_destroy[i];
        }
        if(blocks_to_destroy[i] > last_block_to_destroy_index){
            last_block_to_destroy_index = blocks_to_destroy[i];
        }
    }


    for(let i = blocks.length-1; i > last_block_to_destroy_index; i--){
        
        let index = i - blocks_to_destroy.length;
        blocks[i].x = blocks[index].x;
        blocks[i].y = blocks[index].y;
    }

    blocks.splice(first_block_to_destroy_index, blocks_to_destroy.length);

    points += blocks_to_destroy.length;
}

function finish_level(){
    if(blocks.length == 0){
        level++;

        if(level%3 == 0){
            time_move_blocks_now = Math.max(time_move_blocks_now - 1, 1);
        }

        create_blocks();
    }
}

function game_over(){
    alert("Game Over, You Got "+ points + " Points!");

    points = 0;
    level = 1;
    time_move_blocks_now = time_move_blocks;
    create_blocks();
}

function draw_player(){
    var player_div = document.createElement("div");

    player_div.classList.add(player_color);
    player_div.classList.add("player");
    player_div.style.left = (player_position.x * cell_size)+"px";
    player_div.style.top = (player_position.y * cell_size)+"px";
    player_div.style.width = cell_size + "px";
    player_div.style.height = cell_size + "px";

    game_grid.appendChild(player_div);
}

function draw_shoot(){

    if(shoot_position == null){
        return;
    }

    var shot_div = document.createElement("div");

    shot_div.classList.add(shoot_color);
    shot_div.classList.add("shoot");
    shot_div.style.left = (shoot_position.x * cell_size)+"px";
    shot_div.style.top = (shoot_position.y * cell_size)+"px";
    shot_div.style.width = cell_size + "px";
    shot_div.style.height = cell_size + "px";

    game_grid.appendChild(shot_div);
}

function draw_cursor(){
    var cursor_div = document.createElement("div");
    cursor_div.classList.add("cursor");

    switch(player_shoot_dir){
        case 1:
            cursor_div.style.left = ((player_position.x + cursor_distance_factor) * cell_size)+"px";
            cursor_div.style.top = ((player_position.y - 1) * cell_size)+"px";
            break;
        case 2:
            cursor_div.style.left = ((player_position.x - 1) * cell_size)+"px";
            cursor_div.style.top = ((player_position.y + cursor_distance_factor) * cell_size)+"px";
            cursor_div.style.transform = "rotate(0deg)";
            break;
        case 3:
            cursor_div.style.left = ((player_position.x + cursor_distance_factor) * cell_size)+"px";
            cursor_div.style.top = ((player_position.y + 1 + (cursor_distance_factor * 2)) * cell_size)+"px";
            cursor_div.style.transform = "rotate(-90deg)";
            break;
        case 4:
            cursor_div.style.left = ((player_position.x + 1 + (cursor_distance_factor * 2)) * cell_size)+"px";
            cursor_div.style.top = ((player_position.y - 0 + cursor_distance_factor) * cell_size)+"px";
            cursor_div.style.transform = "rotate(-180deg)";
            break;
    }

    game_grid.appendChild(cursor_div);
}

function draw_blocks(){
    blocks.forEach(block =>{
        var player_div = document.createElement("div");

        player_div.classList.add("block");
        player_div.classList.add(block.color);
        player_div.style.left = (block.x * cell_size)+"px";
        player_div.style.top = (block.y * cell_size)+"px";
        player_div.style.width = cell_size + "px";
        player_div.style.height = cell_size + "px";

        game_grid.appendChild(player_div);
    });
}

function get_color(){
    var color = "";

    switch(getRandomInt(0, 3)){
        case 0:
            color = "red";
            break;
        case 1:
            color = "green";
            break;
        case 2:
            color = "blue";
            break;
    }
    return color;
}

function get_player_color(){
    var blocks_colors = [];

    for(let i = 0; i < blocks.length; i++){
        if(blocks_colors.indexOf(blocks[i].color) == -1){
            blocks_colors.push(blocks[i].color);
        }
    }

    return blocks_colors[getRandomInt(0, blocks_colors.length)];
}

function create_blocks(){

    blocks = [];

    blocks_dir = "D";

    let blocks_on_this_level = (blocks_per_level * level);

    while(blocks.length < blocks_on_this_level){
        let quantity = getRandomInt(Math.min(3, (blocks_on_this_level-blocks.length)), Math.min(8, (blocks_on_this_level-blocks.length)));

        let created_blocks = create_blocks_color(quantity);

        for(let i = 0; i < created_blocks.length; i++){
            blocks.push(created_blocks[i]);
        }
    }
}

function create_blocks_color(quantity){

    let created_blocks = [];

    color = get_color();

    for(let i = 0; i < quantity; i++){
        created_blocks.push({x: 0, y: 0, color: color});
    }

    return created_blocks;
}

function move_blocks(){

    if(update_blocks_in > 0){
        update_blocks_in--;
        return;
    }
    update_blocks_in = time_move_blocks_now;

    for(var i = blocks.length-1; i > 0; i--){
        blocks[i].x = blocks[i-1].x;
        blocks[i].y = blocks[i-1].y;
    }

    switch(blocks_dir){
        case "U":
            if(blocks[0].y > (cells_per_grid_side-1) - blocks[0].x){
                blocks[0].y -=1;
            }else{
                blocks_dir = "L";
                blocks[0].x -=1;
            }
            break;
        case "D":
            if(blocks[0].y < (cells_per_grid_side-1) - blocks[0].x){
                blocks[0].y +=1;
            }else{
                blocks_dir = "R";
                blocks[0].x +=1;
            }
            break;
        case "L":
            if(blocks[0].x > 0 + (blocks[0].y + 1)){
                blocks[0].x -=1;
            }else{
                blocks_dir = "D";
                blocks[0].y +=1;
            }
            break;
        case "R":
            if(blocks[0].x < blocks[0].y){
                blocks[0].x +=1;
            }else{
                blocks_dir = "U";
                blocks[0].y -=1;
            }
            break;
        case "N":
            break;
    }

    if(blocks[0].x == player_position.x && blocks[0].y == player_position.y){
        game_over();
    }
}

function clear_display(){

    var child = this.game_grid.lastElementChild;

    while (child) {
        this.game_grid.removeChild(child);
        child = this.game_grid.lastElementChild;
    }
}

function update_points(){
    points_text_label.innerHTML = "Pontos: " + points;
}

function player_input(){
    document.addEventListener('keypress', (event) => {
        var code = event.code;

        if(player_input_this_frame && shoot_position == null){
            return;
        }

        switch(code){
            case "KeyW":
                player_shoot_dir = 1;
                break;
            case "KeyA":
                player_shoot_dir = 2;
                break;
            case "KeyD":
                player_shoot_dir = 4;
                break;
            case "KeyS":
                player_shoot_dir = 3;
                break;
            case "Space":
                if(shoot_position == null){
                    player_shoot = true;
                }
                break
            case "Enter":
                alert("Pause");
                break;
            case "PLACEHOOLDER":
                break;
        }

        player_input_this_frame = true;
      }, false);
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

create();
setInterval(update, game_speed);