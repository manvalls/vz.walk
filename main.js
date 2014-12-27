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
  var ret,ps;
  
  while(true){
    
    ps = stack;
    stack = opt.stack;
    
    try{
      ret = pop(opt.it,opt.value,opt.error);
      stack = ps;
      
      if(opt.yd) opt.yd.consumed = true;
    }catch(e){
      stack = ps;
      opt.stack.pop();
      
      if(opt.yd) opt.yd.consumed = true;
      opt.yielded.error = e;
      return;
    }
    
    if(ret.done){
      opt.stack.pop();
      opt.yielded.mimic(Yielded.get(ret.value));
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
      ps,
      s;
  
  s = stack || [];
  s.push(id);
  
  ps = stack;
  stack = s;
  
  try{ it = Generator.apply(thisArg || this,args || []); }
  catch(e){
    stack = ps;
    s.pop();
    return Yielded.reject(e);
  }
  
  stack = ps;
  
  if(!(it && it.next && it.throw)){
    s.pop();
    return Yielded.accept(it);
  }
  
  yd = new Yielded();
  
  squeeze({ yielded: yd,
            it: it,
            stack: s
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
