let bg = {}
bg.radius = 30;
bg.lineWidth = 2;
bg.margin = 3;
bg.sides = 6;
bg.drawHexagon = function(context, x, y, radius, sides) {
  const lineWidth = 2;
  // context.fillRect(x-radius - lineWidth, y-radius* Math.sin(2 * Math.PI / sides) - lineWidth, 2*radius + 2*lineWidth, 2*radius * Math.sin(2 * Math.PI / sides)+2*lineWidth);
  // 绘制当前六边形
  context.beginPath();
  context.moveTo(x + radius * Math.cos(0), y + radius * Math.sin(0));

  let maxX = x;
  let maxY = y;
  let minX = x;
  let minY = y;
  for (var j = 1; j <= sides; j++) {
    var angle = j * (2 * Math.PI / sides);
    var xPos = x + radius * Math.cos(angle);
    var yPos = y + radius * Math.sin(angle);
    context.lineTo(xPos, yPos);
    maxX = Math.max(maxX, xPos)
    maxY = Math.max(maxY, yPos)
    minX = Math.min(minX, xPos)
    minY = Math.min(minY, yPos)
  }
  // console.log(maxX, minX, maxX - minX, maxY, minY, maxY - minY)
  // console.log(2 * radius, 2 * radius * Math.sin(2 * Math.PI / sides) + 2 * lineWidth)

  // 设置六边形的样式
  context.lineWidth = lineWidth;
  context.strokeStyle = "#600000";
  context.fillStyle = "#600000";
  const random = Math.round(Math.random()*100) % 2;
  if (random) { context.fill(); }
  context.stroke();

  // 结束绘制
  context.closePath();
}

bg.drawHexagons = function (vertices) {
  // 获取Canvas元素
  var canvas = document.getElementById("hexagonCanvas");
  var context = canvas.getContext("2d");
  var rootElement = document.documentElement;
  var width = rootElement.clientWidth;
  var height = rootElement.clientHeight;
  canvas.width = width;
  canvas.height = height;

  // 设置Canvas尺寸
  // canvas.width = 400;
  // canvas.height = 400;

  // 定义六边形的参数
  var radius = bg.radius;
  var sides = bg.sides;

  // 遍历顶点坐标数组，绘制多个六边形
  for (var i = 0; i < vertices.length; i++) {
    var vertex = vertices[i];
    var x = vertex[0];
    var y = vertex[1];
    bg.drawHexagon(context, x, y, radius, sides)
  }
}

bg.generatePoints = function () {
  const lineWidth = bg.lineWidth;
  var radius = bg.radius;
  var sides = bg.sides;
  const dis = bg.margin;
  const wis = radius + radius * Math.cos(2 * Math.PI / sides) + dis + lineWidth * 2;
  const his = radius * Math.sin(2 * Math.PI / sides) + dis;
  // const wisame = 2*radius + 2* radius * Math.cos(2 * Math.PI / 6);
  const wisame = 2 * wis;
  var vertices = [];
  var vertix = [0, 0]
  for (let w = 0; w < 20; w++) {
    for (let h = 0; h < 20; h++) {
      if (h % 2 == 0) {
        // h*radius*2* Math.sin(2 * Math.PI / 6)
        vertices.push([vertix[0] + w * wisame, vertix[1] + his * h]);
      } else {
        vertices.push([vertix[0] + w * wisame + wis, vertix[1] + his * h]);
      }
    }
  }

  // 调用函数绘制多个六边形
  bg.drawHexagons(vertices);
}

bg.generatePoints();