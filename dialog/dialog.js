(function(){
	var config = {
		buttons: [{
			className: 'dialog-btn',
			text: '确定',
			trigger: 'close'
		}]
	};
	var Template = function (config) {
		var tpl = '<div class="dialog-vam"></div>'+
								'<div class="dialog">';
				tpl += config.header ? '<h3 class="dialog-title">'+config.header.text+(config.header.close?'<span class="dialog-close" trigger="close">&times;</span>':'')+'</h3>' : '';
				tpl += '<div class="dialog-body">' + config.body + '</div>';
				if (config.buttons) {
					tpl += '<div class="dialog-btns">';
					for (var i = 0; i < config.buttons.length; i++) {
						var btn = config.buttons[i];
						tpl += '<button type="button" trigger="'+btn.trigger+'" class="'+(btn.className?btn.className:'dialog-btn')+(i==0?' no-ml':'')+'">'+btn.text+'</button>';
					}
					tpl += '</div>';
				}
				tpl += '</div>';
		return tpl;
	}

	var assign = Object.assign || function(target) {
		for (var i = 1; i < arguments.length; i++) {
			var source = arguments[i];
			for (var key in source) {
				if (source.hasOwnProperty(key)) {
					target[key] = source[key];
				}
			}
		};
	}

	function Dialog (arg) {
		if (this == window) return new Dialog(arg);
		this.config = {};
		if (typeof arg == 'object') {
			assign(this.config, config, arg);
		} else if (typeof arg == 'string') {
			assign(this.config, config);
			this.config.body = arg;
		}
		this.tpl = Template(this.config);
		this.event = {};
		this.open();
	}

	Dialog.prototype = {
		open: function () {
			if (!this.dom) {
				var div = document.createElement('div');
				var that = this;
				div.className = 'dialog-wrap';
				div.innerHTML = this.tpl;
				this.dom = div;
				div.onclick = function (event){
					var trigger = event ? event.target.getAttribute('trigger') : window.event.srcElement.getAttribute('trigger');
					if (trigger) {
						if (typeof that.event[trigger] == 'function') that.event[trigger]();
						else if (trigger == 'close') that.close();
					}
				}
			}
			document.body.appendChild(this.dom);
		},
		close: function () {
			document.body.removeChild(this.dom);
		},
		on: function (type, fn) {
			if (typeof type == 'object') {
				for (var k in type) {
					if (type.hasOwnProperty(k)) this.on(k, type[k]);
				}
			}else if(typeof type == 'string' && typeof fn == 'function') {
				this.event[type] = fn;
			}
		},
		off: function (type) {
			this.event[type] = null;
		},
	}

	if (typeof define != 'undefined' && define.amd) {
		define('dialog', function(){
			return Dialog;
		});
	} else if (typeof module != 'undefined' && module.exports) {
		module.exports = Dialog;
	} else {
		window.Dialog = Dialog;
	}
})();