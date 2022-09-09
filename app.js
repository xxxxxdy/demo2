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

/* 暂时不考虑第一行是标签的情况 */

const max_data_type = 50;
const max_data_length = 3000;

function readTxtFile(filename, callback){
  var reader = new FileReader();
  reader.readAsText(filename);
  reader.onload = function(e){
    var content = e.target.result;
    datas.splice(0, datas.length);
    // console.log(content);
    var datalist = content.split("\n");
    for(let i=0; i<  datalist.length; i++){
      if(i > max_data_length) break;
      if(datalist[i].length < 1) continue;
      var dataEachTime = datalist[i].split(",");
      if(Number(dataEachTime[0])!==Number(dataEachTime[0])){
        var dataTime = [dataEachTime[0]];
        dataTime.push.apply(dataTime, dataEachTime.slice(1, max_data_type+1).map(Number));
        datas.push(dataTime);
      }
      else
        datas.push(dataEachTime.slice(0, max_data_type+1).map(Number));
    }
    // console.log(datas);
    callback();
  }
}


file.onchange = function(){
  if(file.value === file.options[file.length-1].value){
    input.click();
    file.value = null;
  }
  else if(file.value === file.options[1].value){
    readLocalFile("./data/covid19.txt", function(){
      drawLineChart();
      getAndDrawBarcode();
    });
  }
  else if(file.value === file.options[2].value){
    readLocalFile("./data/ele.txt", function(){
      drawLineChart();
      getAndDrawBarcode();
    });
  }
  else if(file.value === file.options[3].value){
    readLocalFile("./data/exchange.txt", function(){
      drawLineChart();
      getAndDrawBarcode();
    });
  }
  else if(file.value === file.options[4].value){
    readLocalFile("./data/solar.txt", function(){
      drawLineChart();
      getAndDrawBarcode();
    });
  }
  else if(file.value === file.options[5].value){
    readLocalFile("./data/traffic.txt", function(){
      drawLineChart();
      getAndDrawBarcode();
    });
  }
}


function readLocalFile(filename, callback){
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
      // console.log(xhr.responseText);
      var content = xhr.responseText;
      datas.splice(0, datas.length);
      // console.log(content);
      var datalist = content.split("\n");
      for(let i=0; i<  datalist.length; i++){
        if(i > max_data_length) break;
        if(datalist[i].length < 1) continue;
        var dataEachTime = datalist[i].split(",");
        if(Number(dataEachTime[0])!==Number(dataEachTime[0])){
          var dataTime = [dataEachTime[0]];
          dataTime.push.apply(dataTime, dataEachTime.slice(1, max_data_type+1).map(Number));
          datas.push(dataTime);
        }
        else
          datas.push(dataEachTime.slice(0, max_data_type+1).map(Number));
      }
      callback();
    }
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
  // drawBarcode(y_range.value);
}
x_range.oninput = function(){
  x_text.value = x_range.value;
  // drawBarcode(y_range.value);
}
y_text.oninput = function(){
  y_range.value = y_text.value;
  drawBarcode(y_range.value);
}
y_range.oninput = function(){
  y_text.value = y_range.value;
  drawBarcode(y_range.value);
}
