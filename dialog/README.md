## dialog（弹窗插件）

### demo
```
  var demo = Dialog({  
    body: '此处是dialog内容，模板字符串',  
    buttons: [{  
      text: '按钮文字',  
      trigger: 'click'  
    },{  
      text: '按钮文字',
			trigger: 'click_right'
		}]
	});
	demo.on({
		click: function(){
			alert('you click the button on the left!');
			demo.close();
		},
		click_right: function(){
			alert('you click the button on the right!');
			demo.close();
		}
	});
```

### summary
可配置的的东西不多
```
  var config = {
    header: {
      text: '标题文字',
      close: true //标题是否带关闭icon
    },
    body: '模板字符串',
    buttons: [  //数组形式
      {
        text: '按钮文字',
        className: 'class-name',  //按钮添加的类名
        trigger: '触发事件'  //此非浏览器默认事件，是通过on()绑定的，close可关闭dialog
      },
      {
      	type: 'link',	//按钮为链接,否则是button
      	href: '/index',
      	className: 'class-name',
      	target: '_blank',	//可以新窗口打开
      	trigger: 'after_click'
      }
    ]
  }
```
#### Dialog.setConfig(config)
全局配置

#### method
##### open()
打开dialog
##### close()
关闭dialog
##### on()
给dialog添加事件
```
  demo.on('click', function(){
    console.log('click');
  })
```
or
```
  demo.on({
    'click': function(){
      console.log('click');
    },
    'someMethod': function(){
      //do something
    }
  })
```
##### off()
给dialog移除事件

##### changeBody()
对于只是改变提示信息，可复用一个dialog。用changeBody('new string')即可改变弹窗内容
