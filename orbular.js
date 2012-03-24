var canvas = document.getElementById('orbs');
var ctx = canvas.getContext('2d');

canvas.width = 600;
canvas.height = 600;

var fps = 30;

function DEG_RAD(deg) {
    return (Math.PI/180) * deg;
}



// holds all orbs
var OrbPile = function() {
    
    this.density = 0.5;
    this.arms = 5;
    this.color = "#ffae23";
    this.armLength = 200;
    this.circleSize = 30;
    this.angle = 0;
    this.rotateSpeed = 0.0;
    
    this.orbs = [];
    
    this.drawOrbs();
    
};

OrbPile.prototype = {
    
    update : function(){
        this.orbCount = Math.floor( ( this.armLength / this.circleSize ) * this.density );
        this.orbDistance = Math.floor( this.armLength / this.orbCount );
        this.armAngle = 360 / this.arms;
        
        this.angle += this.rotateSpeed;
        
        this.orbs = [];
        this.drawOrbs();
    },
    
    drawOrbs : function(){
        
        var r;
        var x;
        var y;
        var rads;
        
        for (var arm=0; arm < this.arms; arm++) {
            
            rads = DEG_RAD( ( this.armAngle * arm ) + this.angle );
            
            for (var count=0; count < this.orbCount; count++) {

                r = this.armLength - ( this.orbDistance * count );
                x = Math.round( ( Math.cos( rads ) * r ) + canvas.height/2 );
                y = Math.round( ( Math.sin( rads ) * r ) + canvas.width/2 );
                
                this.orbs.push( new Orb(x,y,this.circleSize,this.color) );

            }   
            
        }
        
        this.orbs.forEach(function(current){
            current.draw();
        });
        
    }
    
};


var Orb = function(x,y,r,c) {
    
    this.x = x;
    this.y = y;
    this.radius = r;
    this.color = c;
    
};

Orb.prototype = {
    
    draw : function() { 
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, true); 
        ctx.closePath();
        ctx.fillStyle = this.color;
        ctx.fill();
    },
    
    update : function(){
        
        this.draw();
        
    }
    
};

function clearCanvas() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
}

var orbHolder = new OrbPile();

var gui = new dat.GUI();


var guiController = {
    density : gui.add(orbHolder, 'density', 0, 1).step(0.1),
    arms : gui.add(orbHolder, 'arms', 1, 25).step(1),
    armLength : gui.add(orbHolder, 'armLength', 1, 500).step(1),
    circleSize : gui.add(orbHolder, 'circleSize', 1, 90).step(1),
    angle : gui.add(orbHolder, 'angle', 0, 360).step(1),
    rotateSpeed : gui.add(orbHolder, 'rotateSpeed', 0, 1).step(0.1),
    color : gui.addColor(orbHolder, 'color'),
};
/*
for (var prop in guiController) {
    guiController[prop].onChange(function(value) {
        orbHolder.update();
    });
}
*/

window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       || 
          window.webkitRequestAnimationFrame || 
          window.mozRequestAnimationFrame    || 
          window.oRequestAnimationFrame      || 
          window.msRequestAnimationFrame     || 
          function(/* function */ callback, /* DOMElement */ element){
              window.setTimeout(callback, 1000 / fps);
          };
})();

function animate() {
    requestAnimFrame( animate );
    clearCanvas();
    orbHolder.update();
}



var init = function() {
    animate();
};

init();
