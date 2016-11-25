(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(factory);
  } else if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    root.PhotoView = factory();
  }
})(this, function(){
	if (typeof Hammer != 'function') throw TypeError('required Hammer.js(http://hammerjs.github.io)');
	var sw = window.innerWidth,
			sh = window.innerHeight,
			events = ['beforeOpen', 'afterOpen', 'beforeClose', 'afterClose', 'beforeChange', 'afterChange'];

	function get_img_target (e) {
		var target = e.target;
		if (target.tagName != 'IMG') {
			target = target.getElementsByTagName('img');
			if (target) target = target[0];
			else return false;
		}
		return target;
	}

	function createElement (tagName, className, parent) {
		var el = document.createElement(tagName);
		if (className) el.className = className;
		if (parent) parent.appendChild(el);
		return el;
	}

	function transform (tag, matrix) {
		tag.style.webkitTransform = matrix;
		tag.style.transform = matrix;
	}

	function PhotoView(config) {
		this.imgs = [];
		this.zoom = 1;
		this.index = 0;
		this.x = 0;
		this.y = 0;
		this.events = {};
		this.init(config);
	}

	PhotoView.prototype = {
		init: function(config) {
			config = config || {};
			//初始化dom
			this.wrap = createElement('div', 'photoView');
			this.ul = createElement('ul', 'photoView-photos', this.wrap);
			this.installed = false;
			//加载菜单
			this.menu = createElement('div', 'photoView-menu', this.wrap);
			if (config.menu) {
				this.menu.innerHTML = config.menu;
			} else {
				this.menu.innerHTML = '<div class="photoView-close" emit="close">&times;</div>';
			}
			//加载事件
			events.forEach(function(event){
				if (event in config && typeof config[event] == 'function') {
					this.on(event, config[event])
				}
			}, this);

			this.on('close', function(){
				this.close();
			}.bind(this));
			config.el && this.add(config.el);
		},
		open: function(index) {
			if (!this.wrap) return;
			if (this.events.beforeOpen && this.events.beforeOpen[0]() === false) return;
			if (this.installed) {
				this.wrap.classList.remove('photoView-closed');
			} else {
				document.body.appendChild(this.wrap);
				this.installed = true;
				var _self = this, 
						timer,
						hammer = new Hammer(this.ul);
				//添加手势事件
				hammer.get('pan').set({direction: Hammer.DIRECTION_ALL});
				hammer.get('pinch').set({enable: true});
				//左右滑动控制显示图片
				hammer.on('swipe', function(e) {
					if (e.direction == Hammer.DIRECTION_LEFT) {
						if (_self.zoom == 1 || _self.x == (-sw*_self.zoom + sw) / 2 / _self.zoom)
							_self.next();
					} else if (e.direction == Hammer.DIRECTION_RIGHT) {
						if (_self.zoom == 1 || _self.x == (sw*_self.zoom - sw) / 2 / _self.zoom)
							_self.prev();
					}
				});
				//点击显示/隐藏菜单
				hammer.on('tap', function(e){
					clearTimeout(timer);
					timer = setTimeout(function(){
						_self.toggleMenu();
					}, 500);
				});
				//双击放大/重置图片大小
				hammer.on('doubletap', function(e) {
					clearTimeout(timer);
					var target = get_img_target(e);
					if (!target) return;
					if (_self.zoom == 1) {
						transform(target, 'scale(2) translate(0px, 0px)');
						_self.zoom = 2;
						_self.x = 0;
						_self.y = 0;
					} else {
						transform(target, 'scale(1) translate(0px, 0px)');
						_self.zoom = 1;
						_self.x = 0;
						_self.y = 0;
					}
				});
				//缩放，默认最大放大三倍
				hammer.on('pinch', function(e) {
					var target = get_img_target(e);
					if (!target) return;
					if (target.width < sw && target.height < sh) return;
					_self.zoom = Math.min(3, Math.max(e.scale, 0.5));
					transform(target, 'scale('+_self.zoom+') translate('+(_self.x)+'px,'+(_self.y)+'px)');
				});
				hammer.on('pinchend', function(e) {
					var target = get_img_target(e);
					if (!target) return;
					if (_self.zoom < 1) {
						_self.zoom = 1;
						transform(target, 'scale('+_self.zoom+') translate('+(_self.x)+'px,'+(_self.y)+'px)');
					}
				});
				//图片放大情况下移动图片
				hammer.on('panmove', function(e) {
					if (_self.zoom == 1) return;
					var target = get_img_target(e);
					if (!target) return;
					transform(target, 'scale('+_self.zoom+') translate('+(_self.x+e.deltaX/_self.zoom)+'px,'+(_self.y+e.deltaY/_self.zoom)+'px)');
				});
				hammer.on('panend', function(e){
					if (_self.zoom == 1) return;
					var target = get_img_target(e);
					if (!target) return;
					_self.x = (_self.x + e.deltaX / _self.zoom);
					_self.y = (_self.y + e.deltaY / _self.zoom);
					if (target.width * _self.zoom < sw) {
						_self.x = 0;
					} else if (_self.x > target.width / 2 - sw / 2 / _self.zoom) {
						_self.x = target.width / 2 - sw / 2 / _self.zoom;
					} else if (_self.x < sw / 2 / _self.zoom - target.width / 2) {
						_self.x = sw / 2 / _self.zoom - target.width / 2;
					}
					if (target.height*_self.zoom < sh) {
						_self.y = 0;
					} else if (_self.y > target.height / 2 - sh / 2 / _self.zoom) {
						_self.y = target.height / 2 - sh / 2 / _self.zoom;
					} else if (_self.y < sh / 2 / _self.zoom - target.height / 2) {
						_self.y = sh / 2 / _self.zoom - target.height / 2;
					}
					transform(target, 'scale('+_self.zoom+') translate('+(_self.x)+'px,'+(_self.y)+'px)');
				});
				if (this.menu) {
					var menuGesture = new Hammer(this.menu);
					menuGesture.on('tap', function(e){
						e.preventDefault();
						if (e.target.hasAttribute('emit')) {
							var etype = e.target.getAttribute('emit');
							_self.emit(etype);
						}
					});
				}
			}
			this.index = +index || 0;
			if (this.index < 0 || this.index >= this.imgs.length) this.index = 0;
			transform(this.ul, 'translateX(' + -this.index*sw + 'px)');
			this._installImg(this.index);
			this.emit('afterOpen');
		},
		close: function() {
			if (this.events.beforeClose && this.events.beforeClose[0]() === false) return;
			if (this.installed) {
				this.wrap.classList.add('photoView-closed');
				this.emit('afterClose');
			}
		},
		add: function (dom) {
			var doms = [dom],
					imgs = [];
			if (typeof dom === 'object' && dom.length) {
				doms = Array.prototype.slice.call(dom, 0);
			}
			doms.forEach(function(el){
				if (el.tagName && el.tagName == 'IMG') {
					imgs.push(el);
				} else {
					var images = el.getElementsByTagName('img');
					if (images.length)
						Array.prototype.push.apply(imgs, images);
				}
			});

			this.imgs = this.imgs.concat(imgs);

			var fragment = document.createDocumentFragment();
			imgs.forEach(function(item){
				var li = createElement('li', '', fragment);
				li.style.width = sw + 'px';
			});
			this.ul.appendChild(fragment);
			this.size();
		},
		remove: function(index) {
			if (isNaN(index)) {
				index = this.getIndex(index);
			}
			if (index < 0 || index >= this.imgs.length) return;
			this.imgs.splice(index, 1);
			this.ul.removeChild(this.ul.children[index]);
			this.size();
		},
		getIndex: function(img) {
			return this.imgs.indexOf(img);
		},
		getCurrentIndex: function() {
			return this.index;
		},
		getTotal: function() {
			return this.imgs.length;
		},
		size: function() {
			this.ul.style.width = sw * this.imgs.length + 'px';
		},
		_reset: function(i) {
			var img;
			this.zoom = 1;
			this.x = 0;
			this.y = 0;
			this.toggleMenu(true);
			i = Number(i);
			if (isNaN(i)) {
				i = this.index;
			}
			img = this.ul.children[i].getElementsByTagName('img')[0];
			if (img) transform(img, 'scale(1) translate(0,0)');
		},
		next: function () {
			if (this.index == this.imgs.length - 1) return;
			if (this.events.beforeChange && this.events.beforeChange[0](this.index) === false) return;
			this._reset();
			this.index++;
			transform(this.ul, 'translateX(' + -this.index * sw + 'px)');
			this._installImg(this.index);
			this.emit('afterChange', [this.index]);
		},
		prev: function() {
			if (this.index == 0) return;
			if (this.events.beforeChange && this.events.beforeChange[0](this.index) === false) return;
			this._reset();
			this.index--;
			transform(this.ul, 'translateX(' + -this.index * sw + 'px)');
			this._installImg(this.index);
			this.emit('afterChange', [this.index]);
		},
		_installImg: function(i) {
			if (this.ul.children[i].installed) return;
			var img = new Image();
			img.src = this.imgs[i].dataset.src || this.imgs[i].src;
			img.onload = function (){
				this.ul.children[i].appendChild(img);
			}.bind(this);
			this.ul.children[i].installed = true;
		},
		toggleMenu: function(close) {
			if (!this.menu) return;
			if (this.menu.style.display == 'none' && !close) {
				this.menu.style.display = 'block';
			} else {
				this.menu.style.display = 'none';
			}
		},
		//事件模型
		on: function (type, fn){
			if (type instanceof Object) {
				for (var i in type) this.on(i, type[i]);
			} else if (typeof type === 'string' && fn instanceof Function) {
				if (type in this.events) this.events[type].push(fn);
				else this.events[type] = [fn];
			}
			return this;
		},
		off: function (type, fn){
			var i, events = this.events;
			if (type instanceof Object) for(i in type) this.off(i,type[i]);
			if (!fn) this.events[type] = null;
			else if (type in events && typeof fn === 'function') {
				for (i=0; i < events[type].length; i++) {
					if (events[type][i] == fn) events[type].splice(i,1);
				}
			}
			return this;
		},
		one: function(type, fn){
			this.on(type, function callee(){
				fn.apply(this, arguments);
				this.off(type, callee);
			})
		},
		emit: function (type, data){
			var i = 0, events = this.events, args = data||[];
			if (type in events)
				for (; i<events[type].length; i++) {
					events[type][i] && events[type][i].apply(this, data);
				};
			return this;
		}
	}
	return PhotoView;
})