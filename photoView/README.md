# photoView

It's photo viewer for *mobile*, depend on [hammer.js](http://hammerjs.github.io).  
针对移动端的图片查看器，依赖手势库[hammer.js](http://hammerjs.github.io)

## Doc

### init 初始化  
```javascript
var photoview =  new PhotoView({  
    el: , //带data-src属性的缩略图或者图片元素或者图片容器  
    menu: , //菜单html  
    beforeOpen: fn, //事件，同下  
    afterOpen: fn,  
    beforeClose: fn,  
    afterClose: fn,  
    beforeChange: fn,  
    afterChange: fn  
})   
```
### add(img)  
继续添加图片  
### remove(img)  
删除一张图片，也可以传入索引  
### getTotal()  
获取图片总数  
### getCurrentIndex()  
获取当前浏览的图片索引  
### getIndex(img)  
获取图片的索引  
### open(i)  
打开photoView，可传入索引默认浏览第几张图片  
### close()  
关闭photoView  
### prev()  
上一张图片 
### next()  
下一张图片  
### event Model  
支持事件模型，有`on()` `one()` `off()` `emit()` 方法，分别是添加事件，添加一次事件，删除事件，派发事件。 在menu上的元素添加`emit`属性时，当在该元素上触发`tap`事件时会派发`emit`属性值事件。photoView默认有个`close`事件用来关闭photoView 
 
