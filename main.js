
var Property = require('vz.property'),
    Yielded = require('vz.yielded'),
    
    yielded = new Property(),
    generator = new Property();

function initialize(yd,gen){
  if(generator.get(yd,gen)) throw 'Yieldeds can only have one consumer at a time';
  generator.set(yd,gen);
}

function pop(gen,value,error){
  var ret;
  
  if(error) ret = gen.throw(error);
  else if(value !== undefined) ret = gen.next(value);
  else ret = gen.next();
  
  return ret;
}

function squeeze(gen,value,error,yd){
  var ret;
  
  while(true){
    try{
      ret = pop(gen,value,error);
      if(yd) yd.consumed = true;
    }catch(e){
      yielded.get(gen).error = e;
      return;
    }
    
    if(ret.done){
      yielded.get(gen).value = ret.value;
      return;
    }
    
    yd = Yielded.get(ret.value);
    
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
  squeeze(generator.get(this),this.value,this.error,this);
}

module.exports = function(Generator,args,thisArg){
  var gen = Generator.apply(thisArg || this,args || []),
      yd = new Yielded();
  
  yielded.set(gen,yd);
  squeeze(gen);
  
  return yd;
};

