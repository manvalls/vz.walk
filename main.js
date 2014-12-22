var Yielded,
    stack,
    walk;

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
    
    stack = opt.stack;
    
    try{
      ret = pop(opt.it,opt.value,opt.error);
      stack = null;
      
      if(opt.yd) opt.yd.consumed = true;
    }catch(e){
      stack = null;
      opt.stack.pop();
      
      if(opt.yd) opt.yd.consumed = true;
      opt.yielded.error = e;
      return;
    }
    
    if(ret.done){
      opt.stack.pop();
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
      yd,
      s;
  
  s = stack || [];
  s.push(id);
  
  stack = s;
  try{ it = Generator.apply(thisArg || this,args || []); }
  catch(e){
    s.pop();
    stack = null;
    return Yielded.reject(e);
  }
  
  if(!(it && it.next && it.throw)){
    s.pop();
    stack = null;
    return Yielded.accept(it);
  }
  
  yd = new Yielded();
  
  squeeze({ yielded: yd,
            it: it,
            stack: stack
          });
  
  return yd;
};

walk.getStack = function(){
  if(!stack) return [];
  return stack.slice();
};

walk.wrap = function(gen){
  return function(){
    return walk(gen,arguments,this);
  };
};

Yielded = require('vz.yielded');
