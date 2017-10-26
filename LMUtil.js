// 点对象(有图形 圆形，正方形，三角形)
var DragGraph = function(x, y, w, h, fillStyle, canvas, graphShap, strokeStyle){
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
	this.selected = false;
	this.canvas = canvas;
	this.context = canvas.getContext('2d');
	this.fillStyle = fillStyle || strokeStyle || 'rgba(255, 0, 0, 0.3)';
	this.strokeStyle = strokeStyle || 'rgba(255, 0, 0, 0.3)';
	this.graphShap = graphShap || 'circle';	
}
DragGraph.prototype = {
	// 绘制
	paint: function(){
		this.context.save();
		this.context.beiginPath();
		this.context.fillStyle = this.fillStyle;
		this._shapDraw();
		this.context.fill();
		this.context.restore();
	},
	// 绘制路径
	_shapDraw: function(){
		if(this.graphShap == 'circle'){
			this.context.arc(this.x, this.y, 2.5, 0, Math.PI * 2);
		}else(this.graphShap == 'triangle'){
			this.context.moveTo(this.x + 50, this.y + 50);
			this.context.lineTo(this.x + 100, this.y + 130);
			this.context.lineTo(this.x, this.y + 130);
		}else{
			this.context.rect(this.x, this.y, this.w, this.h);
		}
	},
	// 鼠标是否在点上 
	isMouseInGraph: function(mouse){
		var d = (mouse.x - this.x)**2 + (mouse.y - this.y)**2;
		return d <= 25;
	},
	// 清除
	earse: function(){
		this.context.clear(0, 0, this.canvas.width, this.canvas.height);
	},
	// 重新调整尺寸
	resize: function(mouse, delta){
		var ratio = 1 + delta / 15;
		ratio = ratio > 0 ? ratio : 1;
		cx = mouse.x - this.x;
        cy = mouse.y - this.y;
        this.x = mouse.x - cx * ratio;
        this.y = mouse.y - cy * ratio;
	},
	// 缩放以匹配canvas
	fitCanvas: function(ratio, dx, dy){
    	this.x = this.x / ratio + dx;
    	this.y = this.y / ratio + dy;
    },
    // 移动
    move: function(deltaX, deltaY){
    	this.x = this.x + deltaX;
    	this.y = this.y + deltaY;
    }
}
// 线
var DragLine = function(canvas, color, lineWidth){
	this.canvas = canvas;
	this.context = canvas.getContext('2d');
	// 线的点数组
	this.points = [];
	// 
	this.currPoint;
	// 
	this.mouse;
	this.color = color || 'rgba(255, 0, 0, 0.5)';
	this.lineWidth = lineWidth || 3;
}
DragLine.prototype = {
	paint: function(flag){
		if(this.points.length == 0){
			return;
		}
		this._drawLine();
		if(!flag){
			this.points.forEach(function(item){
				item.paint();
			})
			if(this.mouse){
				this.mouse.paint();
			}
		}
	},
	_drawLine: function(){
		var points = this.points;
		this.context.save();
		this.context.beiginPath();
		this.context.moveTo(points[0].x, points[0].y);
		for(var i = 1; i < points.length; i++){
			this.context.lineTo(points[i].x, points[i].y);
		}
		if(this.mouse){
			this.context.lineTo(this.mouse.x, this.mouse.y);
		}
		this.context.strokeStyle = this.color;
		this.context.lineWidth = this.lineWidth;

		this.context.stroke();
		this.context.closePath();
		this.context.restore();
	},
	// 调整尺寸
	resize: function(mouse, delta){
		this.points.forEach(function(item){
			item.resize(mouse, delta);
		});
	},
	// 适应canvas大小
	fitCanvas: function(ratio, dx, dy){
		this.points.forEach(function(item){
			item.fitCanvas(ratio, dx, dy);
		})
	},
	// 移动
	move: function(deltaX, deltaY){
		this.points.forEach(function(item){
			item.move(deltaX, deltaY);
		})
	},
	addPoint: function(mouse){
		this.currPoint = mouse;
		this.points.push(mouse);
	},
	isDragDone: function(mouse){
		if(this.points.length == 0 ){
			return false
		}
		return this.points[this.points.length - 1].isMouseInGraph(mouse);
	}
}
// 矩形
var DragRect = function(left, top, right, bottom, canvas, color, lineWidth){
	this.left = left;
	this.top = top;
	this.right = right; 
	this.bottom = bottom;
	this.canvas = canvas;
	this.context = canvas.getContext('2d');
	this.color = color;
	this.lineWidth = lineWidth || 2;
	this.selected = false;
}
DragRect.prototype = {
	// 绘制
	paint: function(){
		this.context.save();
		this.context.beiginPath();
		this.context.rect(this.left, this.top, this.right - this.left, this.bottom - this.top);
		if(this.selected){
			this.context.fillStyle = this.color;
			this.context.fill();
		}
		this.context.strokeStyle = this.color;
		this.context.lineWidth = this.lineWidth;
		this.closePath();
		this.context.stroke();
		this.context.restore();
	},
	// 调整尺寸
	resize: function(mouse, delta){
		var ratio = 1 + delta / 15;
		ratio = ratio > 0 ? ratio : 1;
		cl = mouse.x - this.left;
		ct = mouse.y - this.top;
		cr = mouse.x - this.right;
		cb = mouse.y - this.bottom;
		this.left = mouse.x - cl * ratio;
		this.top = mouse.y - ct * ratio;
		this.right = mouse.x - cr * ratio;
		this.bottom = mouse.y - cb * ratio;
	},
	// 适应canvas
	fitCanvas: function(ratio, dx, dy){
		this.left = this.left / ratio + dx;
		this.top = this.top / ratio + dy;
		this.right = this.right / ratio + dx;
		this.bottom = this.bottom / ratio + dy;
	},
	// 移动
	move: function(deltaX, deltaY){
		this.left = this.left + deltaX;
		this.top = this.top + deltaY;
		this.right = this.right + deltaX;
		this.bottom = this.bottom + deltaY;
	},
	// 是否在矩形中
	isMouseInRect: function(mouse){
		return mouse.x > this.left && mouse.x < this.right && mouse.y > this.top && mouse.y < this.bottom; 
	}
}
// 多边形
var OutLine = function(canvas,bgImg , color){
	this.canvas = canvas;
	this.context = canvas.getContext('2d');
	this.bgImg = bgImg;
	this.color = color || "rgba(255, 0, 0, 0.9)";
	this.points = [];
	this.currPoint;
	this.mouse;	
}
OutLine.prototype = {
	// 绘制/填充
	paint: function(flag){
		if(this.points.length == 0){
			return;
		}
		if(flag){
			this._fillShape();
		}else{
			this._drawLines();
			this.points.forEach(function(item){
				item.paint();
			})
			if(this.mouse){
				this.mouse.paint();
			}
		}
	},
	// 填充多边形
	_fillShape: function(){
		var points = this.points;
		this.context.save();
		this.context.beiginPath();
		this.context.moveTo(points[0].x, points[0].y);
		for(var i = 1; i < points.length; i++){
			this.context.lineTo(points[i].x, points[i].y);
		}
		this.context.fillStyle = this.color;
		this.fill();
		this.restore();
	},
	// 绘制线
	_drawLines: function(){
		var points = this.points();
		this.context.save();
		this.context.beiginPath();
		this.context.moveTo(points[0].x, points[0].y);
		for(var i = 1; i < points.length; i++){
			this.context.lineTo(points[i].x, points[i].y);
		}
		if(this.mouse){
			this.context.lineTo(this.mouse.x, this.mouse.y);
		}
		this.context.strokeStyle = this.color;
		this.stroke();
		this.restore();
	},
	// 调整大小
	resize: function(mouse, delta){
		this.points.forEach(function(item){
			item.resize(mouse, delta)
		});
	},
	// 适应canvas
	fitCanvas: function(ratio, dx, dy){
		this.points.forEach(function(item){
			item.fitCanvas(ratio, dx, dy);
		})
	},
	// 移动
	move: function(deltaX, deltaY){
		this.points(function(item){
			item.move(deltaX, deltaY);
		});
	},
	// 增加点
	addPoint: function(mouse){
		this.currPoint = mouse;
		this.points.push(mouse);
	},
	// 是否绘制完
	isDragDone: function(mouse){
		if(this.points.length == 0 ){
			return false
		}
		return this.points[0].isMouseInGraph(mouse);
	},
	// 重排点
	reorderPoints: function(){
		var minX = Math.max(bg_img.width, bg_img.img.width);
        var minIndex = 0;
        var points = this.points;
        for (var i = 0; i < points.length; i++) {
            if (points[i].x < minX) {
                minX = points[i].x;
                minIndex = i;
            }
        }
        var ps = [];
        var minP = points[minIndex];
        var nextP = points[(minIndex+1)%points.length]
        var prevP = points[minIndex==0?points.length-1:minIndex-1];
        var prevP = points[(minIndex-1+points.length)%points.length];
        var crossProduct = (minP.x - prevP.x) * (nextP.y - minP.y) - (minP.y - prevP.y) * (nextP.x - minP.x);
        for (var i = 0; i < points.length; i++) {
            var index = crossProduct > 0 ?
                    (minIndex + i) % points.length :                // 顺时针
                    (minIndex - i + points.length) % points.length; // 逆时针
            ps.push(points[index]);
        }
        this.points = ps;
	},
	// 计算真实面积
	calcAreaWithRealCoordinate: function(){
		var area = 0;
		var len = this.points.length;
		for(var i = 0; i < len; i++){
			var x = this._calcRealCoordinate(this.points[i].x, 'x');
            var y = this._calcRealCoordinate(this.points[i].y, 'y');
            var x1 = this._calcRealCoordinate(this.points[(i+1)%len].x, 'x');
            var y1 = this._calcRealCoordinate(this.points[(i+1)%len].y, 'y');
            area += x * y1 - x1 * y;
		}
		return Math.abs(area) / 2;
	},
	// 计算点在图像上的真实坐标
	_calcRealCoordinate: function(c, coordinate = 'x'){
		if(coordinate == 'x'){
			return (c - this.bgImg.x) / this.bgImg.width * this.bgImg.img.width;
		}else{
			return (c - this.bgImg.y) / this.bgImg.height * this.bgImg.img.height;
		}
	}
}

// 图像上覆盖物 (点 线 矩形 多边形)
var MarkObject = function(){
	this.outlines = [];
	this.currOutline;
	this.drawDone = false;
	this.color = 'rgba(255, 0, 0, 0.7)';
}
MarkObject.prototype = {
	// 绘制
	paint: function(){
		for(var i = 0; i < this.outlines.length; i++){
			this.outlines[i].color = this.color;
			if(this.currOutline && i == this.outlines.length - 1){
				this.outlines[i].paint(false);
			}else{
				this.outlines[i].paint(true);
			}
		}
	},
	// 重新调整大小
	resize: function(mouse, delta){
		this.outlines.forEach(function(item){
			item.resize(mouse, delta)
		})
	},
	// 适应canvas
	fitCanvas: function(ratio, dx, dy){
		this.outlines.forEach(function(item){
			item.fitCanvas(ratio, dx, dy);
		})
	},
	move: function(deltaX, deltaY){
		this.outlines.forEach(function(item){
			item.move(deltaX, deltaY);
		})
	},
	// 计算总面积
	calcAreasWithRealCoordinate: function(){
		var area = 0;
        this.outlines.forEach(function(o){
            area += o.calcAreaWithRealCoordinate();
        });
        return area;
	},
	 // 获取物体每个多边形的坐标点
    getSegmentationWithRealCoordinate: function() {
        var seg = [];
        this.outlines.forEach(function(o){
            var coors = [];
            o.points.forEach(function(p){
                coors.push(calcRealCoordinate(p.x, 'x'));
                coors.push(calcRealCoordinate(p.y, 'y'));
            });
            seg.push(coors);
        });
        return seg;
    },
    // 获取外围矩形
    getBboxWithRealCoordinate: function() {
        var top = bg_img.height, bottom = 0, left = bg_img.width, right = 0;
        this.outlines.forEach(function(o){
            o.points.forEach(function(p){
                top = Math.min(p.y, top);
                bottom = Math.max(p.y, bottom);
                left = Math.min(p.x, left);
                right = Math.max(p.x, right);
            });
        });
        left = calcRealCoordinate(left, 'x');
        right = calcRealCoordinate(right, 'x');
        top = calcRealCoordinate(top, 'y');
        bottom = calcRealCoordinate(bottom, 'y');
        var bbox = {
            x: (left + right) / 2,
            y: (top + bottom) / 2,
            w: right - left,
            h: bottom - top
        }
        return bbox;
    }
}
// 图像
var DragImg = function(src, canvas){
	this.img = new Image();
	this.img.src = src;
	this.canvas = canvas;
	this.context = canvas.getContext('2d');
	this.objects = [];
	this.lines = [];
	this.currObject;
	this.dx;
	this.dy;
	var that = this;
	this.img.onload = function(){
		that.x = 0;
		that.y = 0;
		that.width = that.img.width;
		that.height = that.img.height;
		that.fitCanvas();
		that.paint();
	}
}	
DragImg.prototype = {
	// 绘制
	paint: function(){
		this.context.drawImage(this.img, this.x, this.y, this.width, this.height);

		for(var i = 0; i < this.objects.length; i++){
			this.objects[i].paint();
		}
	},
	// 清除
	earse: function(){
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	},
	// 调整尺寸
	resize: function(mouse, delta){
		// 调整图像
		var ratio = 1 + delta / 15;
		ratio = ratio > 0 ? ratio : 1;
		cx = mouse.x - this.x;
		cy = mouse.y - this.y;
		this.x = mouse.x - cx * ratio;
		this.y = mouse.y - cy * ratio;
		this.width = this.width / ratio;
		this.height = this.height / ratio;
		// 调整覆盖物
		this.objects.forEach(function(item){
			item.resize(mouse, delta);
		});
	},
	// 移动
	move: function(deltaX, deltaY){
		// 移动图像
		this.x = this.x + deltaX;
		this.y = this.y + deltaY;
		// 移动覆盖物
		this.objects.forEach(function(item){
			item.mouse(deltaX, deltaY);
		});
	},
	getRatio: function(){
		if(this.img.width / this.img.height > this.canvas.width / this.canvas.height){
			return this.img.width / this.canvas.width;
		}else{
			return this.img.height / this.canvas.height;
		}
	},
	// 适应canvas
	fitCanvas: function(){
		// 图像适应canvas
		var ratio = this.getRatio();
		if(this.img.width / this.img.height > this.canvas.width / this.canvas.height){
			this.y = (this.canvas.height - this.img.height) / 2;
			this.dx = 0;
			this.dy = this.y;
		}else{
			this.x = (this.canvas.width - this.img.width) / 2;
			this.dx = this.x;
			this.dy = 0;
		}
		// 覆盖物适应canvas
		this.objects.forEach(function(item){
			item.fitCanvas(ratio, dx, dy);
		});
	},
	isMouseInImage: function(mouse){
		return mouse.x >= this.x && mouse.x <= this.x + this.width && mouse.y >= this.y && mouse.y <= this.y + this.height
	}
}



























