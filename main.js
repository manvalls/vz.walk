
var Yielded,
    walk,
    current = null;

function pop(it,value,error){
  var ret;
  
  if(error) ret = it.throw(error);
  else if(value !== undefined) ret = it.next(value);
  else ret = it.next();
  
  return ret;
}

function squeeze(opt){
  var ret;
  
  while(true){
    try{
      current = opt.id;
      ret = pop(opt.it,opt.value,opt.error);
      if(opt.yd) opt.yd.consumed = true;
    }catch(e){
      current = null;
      opt.yielded.error = e;
      if(opt.yd) opt.yd.consumed = true;
      return;
    }
    
    if(ret.done){
      opt.yielded.value = ret.value;
      return;
    }
    
    opt.yd = Yielded.get(ret.value);
    
    if(!opt.yd.done){
      opt.yd.on('done',onDone,opt);
      return;
    }
    
    opt.error = opt.yd.error;
    opt.value = opt.yd.value;
  }
  
}

function onDone(e,opt){
  opt.value = this.value;
  opt.error = this.error;
  opt.yd = this;
  
  squeeze(opt);
}

module.exports = walk = function walk(Generator,args,thisArg,id){
  var it,
      yd;
  
  try{
    current = id;
    it = Generator.apply(thisArg || this,args || []);
    current = null;
  }catch(e){
    current = null;
    return Yielded.reject(e);
  }
  
  if(!(it && it.next && it.throw)) return Yielded.accept(it);
  
  yd = new Yielded();
  
  squeeze({ yielded: yd,
            it: it,
            id: id
          });
  
  return yd;
};

Object.defineProperty(walk,'current',{get: function(){
  return current;
}});

walk.wrap = function(gen){
  return function(){
    return walk(gen,arguments,this);
  };
};

Yielded = require('vz.yielded');
