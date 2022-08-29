const shrink_btn = document.querySelector(".shrink-btn");

const file = document.querySelector(".dataset");
const input = document.getElementById("filename");
var x_text = document.getElementById("x-text");
var x_range = document.getElementById("x-range");
var y_text = document.getElementById("y-text");
var y_range = document.getElementById("y-range");

shrink_btn.addEventListener("click", () => {
  document.body.classList.toggle("shrink");
  
  shrink_btn.classList.add("hovered");

  setTimeout(() => {
    shrink_btn.classList.remove("hovered");
  }, 500);
});

file.onchange = function(){
  if(file.value === file.options[file.length-1].value){
    input.click();
  }
  if(file.value === file.options[0].value){

  }
}

/*
function readFile(filename){
  var xhr;
  if(window.XMLHttpRequest){
    xhr = new XMLHttpRequest();
  }
  else{
    xhr = new ActiveXObject("Microsoft.XMLHTTP");
  }
  xhr.open("GET",filename,true);
  xhr.overrideMimeType("text/html;charset=utf-8");
  xhr.send(null);
  xhr.onload = function(){
    if(xhr.status === 200){
      var content = JSON.parse(xhr.responseText);
      console.log(content);
    }
  }
}
*/

/* 暂时不考虑第一行是标签的情况 */

function readTxtFile(filename, callback){
  var reader = new FileReader();
  reader.readAsText(filename);
  reader.onload = function(e){
    var content = e.target.result;
    datas.splice(0, datas.length);
    // console.log(content);
    var datalist = content.split("\n");
    for(let i=0; i<datalist.length; i++){
      datas.push(datalist[i].split(",").map(Number));
    }
    // console.log(datas);
    callback();
  }

}

input.onchange = function(){
  var filelist = input.files;
  if(filelist.length === 0) return;
  readTxtFile(filelist[0], function(){
    drawLineChart();
    getAndDrawBarcode();
  });
} 

x_text.oninput = function(){
  x_range.value = x_text.value;
  drawBarcode(x_range.value, y_range.value);
}
x_range.oninput = function(){
  x_text.value = x_range.value;
  drawBarcode(x_range.value, y_range.value);
}
y_text.oninput = function(){
  y_range.value = y_text.value;
  drawBarcode(x_range.value, y_range.value);
}
y_range.oninput = function(){
  y_text.value = y_range.value;
  drawBarcode(x_range.value, y_range.value);
}
