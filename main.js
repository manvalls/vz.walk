
var Yielded = require('vz.yielded');

function pop(gen,value,error){
  var ret;
  
  if(error) ret = gen.throw(error);
  else if(value !== undefined) ret = gen.next(value);
  else ret = gen.next();
  
  return ret;
}

function squeeze(yielded,gen,value,error,yd){
  var ret;
  
  while(true){
    try{
      ret = pop(gen,value,error);
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
        squeeze(yielded,gen,this.value,this.error,this);
      });
      
      return;
    }
    
    error = yd.error;
    value = yd.value;
  }
  
}

module.exports = function(Generator,args,thisArg){
  var gen = Generator.apply(thisArg || this,args || []),
      yd = new Yielded();
  
  squeeze(yd,gen);
  
  return yd;
};

