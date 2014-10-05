
var Property = require('vz.property'),
    Yielded = require('vz.yielded'),
    
    yielded = new Property(),
    generators = new Property();

function initialize(yd,gen){
  var gens = generators.get(yd);
  
  if(gens) gens.push(gen);
  else generators.set(yd,[gen]);
}

function pop(gen,value,error){
  var ret;
  
  if(error) ret = gen.throw(error);
  else if(value !== undefined) ret = gen.next(value);
  else ret = gen.next();
  
  return ret;
}

function squeeze(gen,value,error){
  var yd,ret;
  
  while(true){
    ret = pop(gen,value,error);
    
    if(ret.done){
      yielded.get(gen).value = ret.value;
      return;
    }
    
    yd = ret.value;
    
    if(!yd.done){
      initialize(yd,gen);
      yd.on('done',onDone);
      
      return;
    }
    
    error = yd.error;
    value = yd.value;
  }
  
}

function onDone(){
  var gens = generators.get(this),
      gen;
  
  while(gen = gens.shift()) squeeze(gen,this.value,this.error);
}

module.exports = function(Generator,args,thisArg){
  var gen = Generator.apply(thisArg || this,args || []),
      yd = new Yielded();
  
  yielded.set(gen,yd);
  squeeze(gen);
  
  return yd;
};

