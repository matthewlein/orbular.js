

var canvas = document.getElementById('orbs');
var ctx = canvas.getContext('2d');

var cWidth = 900;
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
	if ( history.replaceState ) {
	    history.replaceState( JSON.stringify(values),null,'#'+JSON.stringify(values) )
	}
}

function getHash() {
    return JSON.parse( location.hash.replace('#','') );
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
                x =  ( Math.cos( rads ) * r ) + cWidth/2;
                y =  ( Math.sin( rads ) * r ) + cHeight/2;
                
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



var init = function() {
    
    if (window.hash) {
        getHash();
    }
    
    // TODO
    // have defaults obj
    // merge defaults with hash values
    // create orbPile with options
    
    var orbHolder = new OrbPile();


    // --------------------------------------------------------------------- //
    // dat.GUI controller
    // --------------------------------------------------------------------- //


    var gui = new dat.GUI();


    var guiController = {
        arms : gui.add(orbHolder, 'arms', 1, 25).step(1),
        armLength : gui.add(orbHolder, 'armLength', 1, 550).step(1),
        orbSize : gui.add(orbHolder, 'orbSize', 1, 90).step(1),
        orbDensity : gui.add(orbHolder, 'orbDensity', 0, 1).step(0.01),
        centerRadius : gui.add(orbHolder, 'centerRadius', 1, 90).step(1),
        rotateSpeed : gui.add(orbHolder, 'rotateSpeed', -10, 10).step(0.1),
        motionBlur : gui.add(orbHolder, 'motionBlur', 0, 1).step(0.01),
        angle : gui.add(orbHolder, 'angle', 0, 360).step(1),
        orbColor : gui.addColor(orbHolder, 'orbColor'),
        bgColor : gui.addColor(orbHolder, 'bgColor')
    };

    // set change event
    // TODO throttle?
    for (var i=0; i < gui.__controllers.length; i++) {
        gui.__controllers[i].onChange(function(value) {
            values[this.property] = value;
            setHash();
        });
    }
    
    var animate = function() {
        requestAnimFrame( animate );
        orbHolder.update();
    }
    
    animate();
};

init();
