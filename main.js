var Yielded,
    c = require('vz.constants'),
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
    opt.before(opt.id);
    
    try{
      ret = pop(opt.it,opt.value,opt.error);
      opt.after(opt.id);
      if(opt.yd) opt.yd.consumed = true;
    }catch(e){
      opt.after(opt.id);
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

module.exports = walk = function walk(Generator,args,thisArg,control){
  var it,
      yd;
  
  control = control || {};
  control.after = control.after || c.NOOP;
  control.before = control.before || c.NOOP;
  
  control.before(control.id);
  
  try{ it = Generator.apply(thisArg || this,args || []); }
  catch(e){
    control.after(control.id);
    return Yielded.reject(e);
  }
  
  control.after(control.id);
  
  if(!(it && it.next && it.throw)) return Yielded.accept(it);
  
  yd = new Yielded();
  
  squeeze({ yielded: yd,
            it: it,
            
            before: control.before,
            after: control.after,
            id: control.id
          });
  
  return yd;
};

walk.wrap = function(gen){
  return function(){
    return walk(gen,arguments,this);
  };
};

Yielded = require('vz.yielded');
