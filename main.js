
var Property = require('vz.property'),
    generators = new Property();

function initialize(yd,gen){
  var gens = generators.get(yd);
  
  if(gens) gens.push(gen);
  else generators.set(yd,[gen]);
}

function pop(gen,value){
  var ret;
  
  if(value !== undefined) ret = gen.next(value);
  else ret = gen.next();
  
  return ret;
}

function squeeze(gen,value){
  var yd,ret;
  
  while(true){
    ret = pop(gen,value);
    
    if(ret.done) return;
    yd = ret.value;
    
    if(!yd.done){
      initialize(yd,gen);
      yd.on('done',onDone);
      
      return;
    }
    
    if(yd.error) gen.throw(yd.error);
    else value = yd.value;
  }
  
}

function onDone(){
  var gens = generators.get(this),
      gen;
  
  if(this.error) while(gen = gens.shift()) gen.throw(this.error);
  else while(gen = gens.shift()) squeeze(gen,this.value);
}

module.exports = function(Generator,args,thisArg){
  squeeze(Generator.apply(thisArg || this,args || []));
};

