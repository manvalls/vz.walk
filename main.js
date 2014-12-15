
var Yielded,
    walk;

function pop(it,value,error){
  var ret;
  
  if(error) ret = it.throw(error);
  else if(value !== undefined) ret = it.next(value);
  else ret = it.next();
  
  return ret;
}

function squeeze(yielded,it,value,error,yd){
  var ret;
  
  while(true){
    try{
      ret = pop(it,value,error);
      if(yd) yd.consumed = true;
    }catch(e){
      yielded.error = e;
      if(yd) yd.consumed = true;
      return;
    }
    
    if(ret.done){
      yielded.value = ret.value;
      return;
    }
    
    yd = Yielded.get(ret.value);
    
    if(!yd.done){
      yd.on('done',function(){
        squeeze(yielded,it,this.value,this.error,this);
      });
      
      return;
    }
    
    error = yd.error;
    value = yd.value;
  }
  
}

module.exports = walk = function walk(Generator,args,thisArg){
  var it,
      yd;
  
  try{ it = Generator.apply(thisArg || this,args || []); }
  catch(e){ return Yielded.reject(e); }
  
  if(!(it && it.next && it.throw)) return Yielded.accept(it);
  
  yd = new Yielded();
  squeeze(yd,it);
  
  return yd;
};

module.exports.wrap = function(gen){
  return function(){
    return walk(gen,arguments,this);
  };
};

Yielded = require('vz.yielded');
