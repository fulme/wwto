const fs=require("fs"),gulp=require("gulp"),fse=require("fs-extra"),rename=require("gulp-rename"),replace=require("gulp-replace"),uneval=require("uneval"),md5Hex=require("md5-hex"),config=require("../../config"),balancingGroup=require("../../utils/balancing-group"),ab2str=require("arraybuffer-to-string"),str2ab=require("to-buffer"),through2=require("through2"),DOMParser=require("xmldom").DOMParser,extractFn=require("../../utils/extra-function"),scopeStyle=require("../../scope/scope-style"),scopeTemplate=require("../../scope/scope-template");function defQuery(e,r){return[e,`${r} = ${r} || {}; ${r}.query = ${r}.query || {};`].join("")}function convert(opt={}){const src=opt.source||"./src",dest=opt.target||"./alibaba",assets=opt.assets||config.getAssets(src);gulp.src(assets).pipe(gulp.dest(dest)),gulp.src(src+"/**/*.wxss").pipe(replace('.wxss"','"')).pipe(through2.obj(function(e,r,t){let p=e.history[0].replace(e.base,"").replace(".wxss",""),s=e.history[0].replace(".wxss",".json");fs.exists(s,r=>{if(r){let r=fs.readFileSync(s);if(/"component":\s*true/.test(r)){let r="_"+md5Hex(p),s=ab2str(e.contents);scopeStyle(r,s).then(r=>{e.contents=str2ab(r),this.push(e),t()})}else this.push(e),t()}else this.push(e),t()})})).pipe(rename(function(e){e.extname=".acss"})).pipe(gulp.dest(dest)),gulp.src(src+"/**/*.wxml").pipe(replace("wx:","a:")).pipe(replace("a:for-items","a:for")).pipe(replace(".wxml",".axml")).pipe(replace(/\s+formType=['"]\w+['"]/g,function(e){return e.replace("formType","form-type")})).pipe(replace(/<canvas[^>]+(canvas-id)=['"]/g,function(e,r){return e.replace(r,"id")})).pipe(replace(/a:for-index=['"]({{\w+}})['"]/gi,function(e,r){return e.replace("{{","").replace("}}","")})).pipe(replace(/<import\s+src="([\w]+)/gi,function(e,r){return e.replace(r,["./",r].join(""))})).pipe(replace(/<[\w]+/gi,function(e,r){return e.replace(/[A-Z]/g,e=>["-",e.toLowerCase()].join(""))})).pipe(replace(/<\/[\w]+>/gi,function(e,r){return e.replace(/[A-Z]/g,e=>["-",e.toLowerCase()].join(""))})).pipe(replace(/{{[^}]+(<)[^=\s][^}]+}}/gi,function(e,r){return e.replace(r,[r," "].join(""))})).pipe(replace(/\s+bind[\w]+=['"]/gi,function(e,r){return e.replace(/bind(\w)/g,(e,r)=>["on",r.toUpperCase()].join(""))})).pipe(replace(/\s+catch[\w]+=['"]/gi,function(e,r){return e.replace(/catch(\w)/g,(e,r)=>["on",r.toUpperCase()].join(""))})).pipe(through2.obj(function(e,r,t){let p=e.history[0].replace(e.base,"").replace(".wxml",""),s=e.history[0].replace(".wxml",".json");fs.exists(s,r=>{if(r){let r=fs.readFileSync(s);if(/"component":\s*true/.test(r)){let r="_"+md5Hex(p),s=ab2str(e.contents),n=(new DOMParser).parseFromString(s);scopeTemplate(n,r);let a=n.toString().replace(/xmlns:a=""/g,"").replace(/&amp;/g,"&").replace(/&quot;/g,"'").replace(/&lt;/g,"<").replace(/&gt;/g,">");e.contents=str2ab(a),this.push(e),t()}else this.push(e),t()}else this.push(e),t()})})).pipe(rename(function(e){e.extname=".axml"})).pipe(gulp.dest(dest));const destConfigFile=dest+"/project.config.json",jsonSrc=[src+"/**/*.json"];fs.exists(destConfigFile,e=>{e&&jsonSrc.push("!"+src+"/project.config.json"),gulp.src(jsonSrc).pipe(replace(/tabBar([^\]]+)/,function(e,r){return e.replace(/"list":/i,'"items":').replace(/"color":/gi,'"textColor":').replace(/"text":/gi,'"name":').replace(/"iconPath":/g,'"icon":').replace(/"selectedIconPath":/g,'"activeIcon":')})).pipe(replace(/usingComponents([^}]+)/g,function(e,r){return e.replace(/"([\w]+)":/gi,(e,r)=>e.replace(r,r.replace(/[A-Z]/g,e=>["-",e.toLowerCase()].join(""))))})).pipe(replace(/usingComponents([^}]+)/g,function(e,r){return e.replace(/":\s*"([\w])/gi,(e,r)=>e.replace(r,["/",r].join("")))})).pipe(gulp.dest(dest))}),gulp.src(__dirname+"/adaptor.js").pipe(gulp.dest(dest)).on("end",()=>{console.log("复制：adaptor.js")}),gulp.src(src+"/**/*.js").pipe(replace(/(require\(['"])(\w+)/g,"$1./$2")).pipe(replace(/(from\s+['"])(\w+)/g,function(e,r){return e.replace(r,[r,"./"].join(""))})).pipe(replace(/(let|var|const)\s+fetch\s*=/g,"$1 renameFetch = ")).pipe(replace(/(\s+)fetch([;\s]*)$/,"$1renameFetch$2")).pipe(replace(/[^\w.'"]fetch[.(]/g,function(e){return e.replace(/fetch/g,"renameFetch")})).pipe(replace(/App\({[\s\S]+(onLaunch|onShow):\s*function\s*\(\s*(\w+)\s*\)[^{]*{/g,function(e,r,t){return defQuery(e,t)})).pipe(replace(/App\({[\s\S]+(onLaunch|onShow)\s*\(\s*(\w+)\s*\)[^{]*{/g,function(e,r,t){return defQuery(e,t)})).pipe(replace(/App\({[\s\S]+(onLaunch|onShow):\s*\(\s*(\w+)\s*\)\s*=>\s*[^{]*{/g,function(e,r,t){return defQuery(e,t)})).pipe(replace(/Component\([\s\S]+properties:[^{]*{/,function(e){return e.replace("properties","props")})).pipe(replace(/\.properties/g,function(e){return e.replace(".properties",".props")})).pipe(replace(/Component\([\s\S]+methods:[^{]*{/,function(e){return[e,"triggerEvent: function(name, opt) {\n            this.props['on' + name[0].toUpperCase() + name.substring(1)]({detail:opt});\n          },\r\n"].join("")})).pipe(replace(/[\s\S]+/,function(match){if(!match.match(/Component\(/))return match;const lifeCircleNames=["created","attached","ready","detached"];let lifeCircleFns="";lifeCircleNames.map(e=>{let{args:r,body:t}=extractFn(match,e);lifeCircleFns+=e+"("+r+")"+(t||"{}")+",\r\n"});let methods=(match.match(/methods:[\s\n]*{/)||{})[0];match=methods?match.replace(methods,[methods,lifeCircleFns].join("\r\n")):match.replace("Component({",["Component({","methods: {",lifeCircleFns,"}"].join("\r\n"));let props=(match.match(/props:[\s\S]+/)||{})[0]||"";if(!props)return match;let str=balancingGroup(props),obj=eval("("+str+")"),has=Object.prototype.hasOwnProperty,propMap={},observerMap=null,events=match.match(/\.triggerEvent\(['"]\w+['"]/g)||[];for(let e=0;e<events.length;e++){let r=events[e],t=r.match(/\(['"](\w+)['"]/)[1];t="on"+t[0].toUpperCase()+t.substring(1),propMap[t]=(()=>{})}for(let key in obj)if(has.call(obj,key)){let item=obj[key];propMap[key]=item.value,item.observer&&(observerMap=observerMap||{},"function"==typeof item.observer?observerMap[key]=item.observer:observerMap[key]=eval('() => {\n                  this["'+item.observer+'"].apply(this, arguments);\n                }'))}let didMount="\n        didMount() {\n          this.data = Object.assign({}, this.data, this.props);\n          \n          this.created && this.created.apply(this, arguments);\n          this.attached && this.attached.apply(this, arguments);\n          this.ready && this.ready.apply(this, arguments);\n        }",didUnmount=",\n        didUnmount() {\n          this.detached && this.detached.apply(this, arguments);\n        }",didUpdate=",";observerMap&&(didUpdate=",\n          didUpdate: function(prevProps, preData) {\n            for (let key in this.props) {\n              if (typeof(_observers[key]) === 'function') {\n                if (JSON.stringify(prevProps[key]) !== JSON.stringify(this.props[key]) && \n                JSON.stringify(preData[key]) !== JSON.stringify(this.props[key])) {\n                  this.setData(Object.assign({}, this.data, {[key]: this.props[key]}));\n                  _observers[key].apply(this, [this.props[key], prevProps[key]]);\n                }\n              }\n            }\n          },");let lifeCircle=[didMount,didUnmount,didUpdate].join(""),observers=uneval(observerMap).replace(/^\(|\)$/g,"").replace(/observer\(/g,"function(").replace(/\(\) => {/g,"function() {"),newProps=props.replace(str,uneval(propMap).replace(/^\(|\)$/g,""));return match.replace("Component({","let _observers = "+observers+";\r\nComponent({\r\n"+lifeCircle).replace(props,newProps)})).pipe(replace(/methods:[\s\n]*{[\s\S]*/g,function(e){return e.replace(/on\w+\((\w+)\)\s*{/g,function(e,r){return[e,`if (${r} && ${r}.target && ${r}.target.targetDataset) {\n              ${r}.target.dataset = ${r}.target.targetDataset;\n            }`].join("\r\n")})})).pipe(through2.obj(function(e,r,t){let p=e.history[0].replace(e.base,"").split("/"),s=["import wx from '"+new Array(p.length).fill("..").concat("adaptor.js").join("/").replace(/^\.\./,".")+"';",ab2str(e.contents)].join("\r\n");e.contents=str2ab(s),this.push(e),t()})).pipe(gulp.dest(dest))}module.exports=convert;