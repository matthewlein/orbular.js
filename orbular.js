


var Orbular = (function(){
    
    var canvas = document.getElementById('orbs');
    var ctx = canvas.getContext('2d');

    var cWidth = 900;
    var cHeight = 600;

    canvas.width = cWidth;
    canvas.height = cHeight;
    
    // only for requestAnimationFrame fallback
    var fps = 30;

    // --------------------------------------------------------------------- //
    // Helpers
    // --------------------------------------------------------------------- //

    function DEG_RAD(deg) {
        return (Math.PI/180) * deg;
    }

    function setHash(obj) {
    	if ( history.replaceState ) {
    	    history.replaceState( JSON.stringify(obj),null,'#'+JSON.stringify(obj) )
    	}
    }

    function getHash() {
        try {
            return JSON.parse( location.hash.replace('#','') );
        } catch(e) {}
    }

    // thx jQuery, you're the best!
    function extend() {
        var options, name, src, copy, copyIsArray, clone, target = arguments[0] || {},
            i = 1,
            length = arguments.length,
            deep = false;

        // Handle a deep copy situation
        if (typeof target === "boolean") {
            deep = target;
            target = arguments[1] || {};
            // skip the boolean and the target
            i = 2;
        }

        // Handle case when target is a string or something (possible in deep copy)
        if (typeof target !== "object" && !jQuery.isFunction(target)) {
            target = {};
        }

        // extend jQuery itself if only one argument is passed
        if (length === i) {
            target = this;
            --i;
        }

        for (; i < length; i++) {
            // Only deal with non-null/undefined values
            if ((options = arguments[i]) != null) {
                // Extend the base object
                for (name in options) {
                    src = target[name];
                    copy = options[name];

                    // Prevent never-ending loop
                    if (target === copy) {
                        continue;
                    }

                    // Recurse if we're merging plain objects or arrays
                    if (deep && copy && (jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)))) {
                        if (copyIsArray) {
                            copyIsArray = false;
                            clone = src && jQuery.isArray(src) ? src : [];

                        } else {
                            clone = src && jQuery.isPlainObject(src) ? src : {};
                        }

                        // Never move original objects, clone them
                        target[name] = jQuery.extend(deep, clone, copy);

                        // Don't bring in undefined values
                    } else if (copy !== undefined) {
                        target[name] = copy;
                    }
                }
            }
        }

        // Return the modified object
        return target;
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
    var OrbPile = function(options) {
    
        this.opts = options;
    
        this.orbDensity = this.opts.orbDensity;
        this.arms = this.opts.arms;
        this.orbColor = this.opts.orbColor;
        this.armLength = this.opts.armLength;
        this.orbSize = this.opts.orbSize;
        this.angle = this.opts.angle;
        this.rotateSpeed = this.opts.rotateSpeed;
        this.centerRadius = this.opts.centerRadius;
        this.motionBlur = this.opts.motionBlur;
        this.bgColor = this.opts.bgColor;

    
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



    var defaultOpts = {
        arms : 5,
        armLength : 200,
        orbSize : 30,
        orbDensity : 0.5,
        centerRadius : 30,
        rotateSpeed : 0.1,
        motionBlur : 0.02,
        angle : 0,
        orbColor : "#ffae23",
        bgColor : [255,255,255]
    }

    var userOpts = {};


    var init = function() {
    
        if (location.hash) {
            userOpts = getHash();
        }
    
        var opts = extend( {}, defaultOpts, userOpts);
    

    
        var orbHolder = new OrbPile(opts);


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
                userOpts[this.property] = value;
                setHash(userOpts);
            });
        }
    
        var animate = function() {
            requestAnimFrame( animate );
            orbHolder.update();
        }
    
        animate();
    
    };

    init();
    
})();
