

var canvas = document.getElementById('orbs');
var ctx = canvas.getContext('2d');

var cWidth = 600;
var cHeight = 600;

canvas.width = cWidth;
canvas.height = cHeight;

var fps = 30;

// --------------------------------------------------------------------- //
// Helpers
// --------------------------------------------------------------------- //

function DEG_RAD(deg) {
    return (Math.PI/180) * deg;
}

function setHash() {
	location.hash = '#' + JSON.stringify(values);
}

function getHash() {
    values = JSON.parse( location.hash.replace('#','') );
}


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

// --------------------------------------------------------------------- //
// Objects
// --------------------------------------------------------------------- //

// holds all orbs
var OrbPile = function() {
    
    this.orbDensity = 0.5;
    this.arms = 5;
    this.orbColor = "#ffae23";
    this.armLength = 200;
    this.orbSize = 30;
    this.angle = 0;
    this.rotateSpeed = 0.1;
    this.centerRadius = 30;
    this.motionBlur = 0.02;
    this.bgColor = [255,255,255];
    
    this.orbs = [];
    
};

OrbPile.prototype = {
    
    update : function(){
        this.orbCount = Math.floor( ( this.armLength / this.orbSize ) * this.orbDensity );
        this.orbDistance = Math.floor( this.armLength / this.orbCount );
        this.armAngle = 360 / this.arms;
        this.angle += this.rotateSpeed;
        
        this.orbs = [];
        this.clearCanvas();
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

                r =  this.centerRadius + ( this.orbDistance * count );
                x =  ( Math.cos( rads ) * r ) + cHeight/2;
                y =  ( Math.sin( rads ) * r ) + cWidth/2;
                
                this.orbs.push( new Orb(x,y,this.orbSize,this.orbColor) );

            }   
            
        }
        
        this.orbs.forEach(function(current){
            current.draw();
        });
        
    },
    
    clearCanvas : function() {    
        ctx.save();
        //semi-transparent box for motion trails
        var r = Math.round( this.bgColor[0] );
        var g = Math.round( this.bgColor[1] );
        var b = Math.round( this.bgColor[2] );
        var a = (1 - this.motionBlur);
        
        ctx.fillStyle = "rgba(" + r + "," + g + "," + b + "," + a + ")";
        ctx.fillRect(0,0,cWidth,cHeight);

        ctx.restore();
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
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, true); 
        ctx.closePath();
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.restore();
    },
    
    update : function(){
        
        this.draw();
        
    }
    
};

var orbHolder = new OrbPile();


// --------------------------------------------------------------------- //
// dat.GUI controller
// --------------------------------------------------------------------- //


var gui = new dat.GUI({
    arms : 13
});


var guiController = {
    arms : gui.add(orbHolder, 'arms', 1, 25).step(1),
    armLength : gui.add(orbHolder, 'armLength', 1, 500).step(1),
    orbSize : gui.add(orbHolder, 'orbSize', 1, 90).step(1),
    orbDensity : gui.add(orbHolder, 'orbDensity', 0, 1).step(0.01),
    centerRadius : gui.add(orbHolder, 'centerRadius', 1, 90).step(1),
    rotateSpeed : gui.add(orbHolder, 'rotateSpeed', -10, 10).step(0.1),
    motionBlur : gui.add(orbHolder, 'motionBlur', 0, 1).step(0.01),
    angle : gui.add(orbHolder, 'angle', 0, 360).step(1),
    orbColor : gui.addColor(orbHolder, 'orbColor'),
    bgColor : gui.addColor(orbHolder, 'bgColor')
};

for (var i=0; i < gui.__controllers.length; i++) {
    gui.__controllers[i].onChange(function(value) {
        values[this.property] = value;
    });
}




var values = {
    arms : 0,
    armLength : 0,
    orbSize : 0,
    orbDensity : 0,
    centerRadius : 0,
    rotateSpeed : 0,
    motionBlur : 0,
    angle : 0,
    orbColor : 0,
    bgColor : 0
}



/*
for (var prop in guiController) {
    guiController[prop].onFinishChange(function(value) {
        values[this.property] = value;
        console.log(value)
    });
}
*/


/*
function getColors() {
    
    var colors = document.querySelectorAll('li.color');
    var prop;
    var val;
    
    for (var i=0; i < colors.length; i++) {
        prop = colors[i].querySelectorAll('.property-name')[0].innerHTML;
        val = colors[i].querySelectorAll('input')[0].value;
        values[prop] = val;
    }
}

function colorEvents() {
    
    var colorsInputs = document.querySelectorAll('li.color input');
    
    console.log(colorsInputs)
    
    for (var i=0; i < colorsInputs.length; i++) {
         console.log('change')
        colorsInputs[i].addEventListener('change', function() {
            console.log('change')
        }, false);
    }
    
}
for (var i=0; i < gui.__controllers.length; i++) {
    gui.__controllers[i].onFinishChange(function(value) {
        values[this.property] = value;
        // have to get colors every time cuz its change is busted
        //getColors();
    });
}
*/
var animate = function() {
    requestAnimFrame( animate );
    orbHolder.update();
}

var init = function() {
    animate();
};

init();
