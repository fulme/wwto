const fs=require("fs"),gulp=require("gulp"),fse=require("fs-extra"),ab2str=require("arraybuffer-to-string"),str2ab=require("to-buffer"),through2=require("through2"),rename=require("gulp-rename"),replace=require("gulp-replace"),config=require("../../config");function convert(e={}){const r=e.source||"./src",p=e.target||"./baidu",t=e.assets||config.getAssets(r);gulp.src(t).pipe(gulp.dest(p)),gulp.src(r+"/**/*.wxss").pipe(replace('.wxss"','"')).pipe(replace(/url\(['"](\/\/[^'"]+)['"]\)/gi,function(e,r){return e.replace(/\/\//g,e=>"https:"+e)})).pipe(replace(/url\((\/\/[^'"]+)\)/gi,function(e,r){return e.replace(/\/\//g,e=>"https:"+e)})).pipe(replace(/[^,}\n]*image[,{]/gi,function(e,r){return e.replace(/image/g,".fix-image-cls")})).pipe(rename(function(e){e.extname=".css"})).pipe(gulp.dest(p)),gulp.src(r+"/**/*.wxml").pipe(replace("wx:","s-")).pipe(replace("s-for-items","s-for")).pipe(replace(".wxml",".swan")).pipe(replace("></input>","/>")).pipe(replace(/<[\w]+/gi,function(e,r){return e.replace(/[A-Z]/g,e=>["-",e.toLowerCase()].join(""))})).pipe(replace(/<\/[\w]+>/gi,function(e,r){return e.replace(/[A-Z]/g,e=>["-",e.toLowerCase()].join(""))})).pipe(replace(/{{[^}]+(<)[^=\s][^}]+}}/gi,function(e,r){return e.replace(r,[r," "].join(""))})).pipe(replace(/{{[^}\d\w]*(\.)[\d][^}]+}}/g,function(e,r){return e.replace(r,["0",r].join(""))})).pipe(replace(/scroll-into-view=["']{{([^}]+)}}["']/g,function(e,r){return e.replace("{{","").replace("}}","").replace(r,"{="+r+"=}")})).pipe(replace(/scroll-top=["']{{([^}]+)}}["']/g,function(e,r){return e.replace("{{","").replace("}}","").replace(r,"{="+r+"=}")})).pipe(replace(/scroll-left=["']{{([^}]+)}}["']/g,function(e,r){return e.replace("{{","").replace("}}","").replace(r,"{="+r+"=}")})).pipe(replace(/<template.*\s+data=["']({{[^}]+}})/g,function(e,r){return e.replace(r,"{"+r+"}")})).pipe(replace(/<image([^>]+)>/g,function(e,r){return e.match(/class=/)?e:e.replace(r,[' class="fix-image-cls" ',r].join(""))})).pipe(replace(/url\(['"](\/\/[^'"]+)['"]\)/gi,function(e,r){return e.replace(/\/\//g,e=>"https:"+e)})).pipe(replace(/url\((\/\/[^'"]+)\)/gi,function(e,r){return e.replace(/\/\//g,e=>"https:"+e)})).pipe(replace(/url=["']{{([^{}\s\?=]+)}}/gi,function(e,r){return e.replace(r,"("+r+"[0]=='/' && "+r+"[1]=='/') ? 'https:' + "+r+":"+r)})).pipe(replace(/url\({{([^{}\s\?=]+)}}/gi,function(e,r){return e.replace(r,"("+r+"[0]=='/' && "+r+"[1]=='/') ? 'https:' + "+r+":"+r)})).pipe(rename(function(e){e.extname=".swan"})).pipe(gulp.dest(p));const i=p+"/project.config.json",n=[r+"/**/*.json"];return fs.exists(i,e=>{e&&n.push("!"+r+"/project.config.json"),gulp.src(n).pipe(replace(/usingComponents([^}]+)/g,function(e,r){return e.replace(/"([\w]+)":/gi,(e,r)=>e.replace(r,r.replace(/[A-Z]/g,e=>["-",e.toLowerCase()].join(""))))})).pipe(gulp.dest(p))}),gulp.src(__dirname+"/adaptor.js").pipe(gulp.dest(p)).on("end",()=>{console.log("复制：adaptor.js")}),gulp.src(r+"/**/*.js").pipe(replace(/['"](\/\/\w+\.\w+)/g,function(e,r){return e.replace(r,["https:",r].join(""))})).pipe(replace(/\.option\.transition\.delay/g,".delay")).pipe(replace(/\.option\.transition\.duration/g,".duration")).pipe(replace(/\.option\.transition\.timingFunction/g,".duration")).pipe(through2.obj(function(e,r,p){let t=e.history[0].replace(e.base,"").split("/"),i=["import wx from '"+new Array(t.length).fill("..").concat("adaptor.js").join("/").replace(/^\.\./,".")+"';",ab2str(e.contents)].join("\r\n");e.contents=str2ab(i),this.push(e),p()})).pipe(gulp.dest(p))}module.exports=convert;