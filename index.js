#!/usr/bin/env node
var mkdirp = require('mkdirp');
var touch = require('touch');
var fs = require('fs-extra')
var process = require('process');
var colors = require('colors');
var prompt = require('prompt');
var scriptName = 'app';
var request = require('request');
var packagejson = require('./package.json');
var cmd = require('node-cmd');
var value = process.argv[2];
var argument3 = process.argv[3];
var argument4 = process.argv[4];


//
//on init run genScript
initScript();
//
//


function initScript(){
  genScript()
    if (value === 'new') {
        setTimeout(function () {
            console.log('installing npm modules...');
        }, 1500);
        installModules();
    }
}

function installModules(){
  cmd.get(
        `
            cd ${argument3}
            npm i
        `,
        function(data){
            console.log('installation of npm modules complete!');
        }
    );
}

//declaring script as function in order to re-execute the script
function genScript(){

//spilt 'gen new' from 'gen {{COMPONENT NAME}}'
if (value === 'new') {
// generate a brand new project with the name
//argument 3 is now the project name
mkdirp(argument3, function (err) {
  if (err) console.error(err)
  else
  process.chdir(argument3),

  //generte .gitignore
  fs.writeFile(".gitignore", `.DS_Store
.tmp
.git
node_modules
.settings
*.log
client/bundle.js
client/bundle.js.map
.idea` , function(err) {
      if(err) {
          return console.log(` ❌  failed to generate due to error:  ${err}`);
      }
      console.log(" 🎁  created: ".cyan + ".gitignore".white);
  });

  //generte webpack.config.js
  fs.writeFile("webpack.config.js", `var path = require('path'),
    webpack = require("webpack"),
    libPath = path.join(__dirname, 'client'),
    wwwPath = path.join(__dirname, 'dist'),
    pkg = require('./package.json'),
    HtmlWebpackPlugin = require('html-webpack-plugin');


const isDev = process.env.NODE_ENV !== 'production';

module.exports = {
  entry: path.join(libPath, '/app/app.module.js'),
  output: {
    path: path.join(wwwPath),
    filename: isDev ? 'bundle.js' : 'bundle.[chunkHash].js'
  },
  module: {
    loaders: [{
      test: /\\.html$/, loader: 'raw'
    }, {
      test: /\\.(png|jpg)$/,
      loader: 'file?name=img/[name].[ext]' // inline base64 URLs for <=10kb images, direct URLs for the rest
    },{
      test: /\\.scss$/,loader: 'style!css!sass'
    }, {
      test: /\\.css$/, loader: 'style!css'
    }, {
      test: /\\.js$/,
      exclude: /(node_modules)/,
      loader: "ng-annotate?add=true!babel"
    }, {
      test: [/fontawesome-webfont\\.svg/, /fontawesome-webfont\\.eot/, /fontawesome-webfont\\.ttf/, /fontawesome-webfont\\.woff/, /fontawesome-webfont\\.woff2/],
      loader: 'file?name=fonts/[name].[ext]'
    },
      { test: /\\.(ttf|otf|eot|svg|woff(2)?)$/, loader: 'url' }]
  },
  plugins: [

    // HtmlWebpackPlugin: Simplifies creation of HTML files to serve your webpack bundles : https://www.npmjs.com/package/html-webpack-plugin
    new HtmlWebpackPlugin({
      filename: 'index.html',
      pkg: pkg,
      template: path.join(libPath, 'index.ejs'),
      inject: true
    }),

    // OccurenceOrderPlugin: Assign the module and chunk ids by occurrence count. : https://webpack.github.io/docs/list-of-plugins.html#occurenceorderplugin
    new webpack.optimize.OccurenceOrderPlugin(),

    // Deduplication: find duplicate dependencies & prevents duplicate inclusion : https://github.com/webpack/docs/wiki/optimization#deduplication
    new webpack.optimize.DedupePlugin()
  ]
};
` , function(err) {
      if(err) {
          return console.log(` ❌  failed to generate due to error:  ${err}`);
      }
      console.log(" 🎁  created: ".cyan + "webpack.config.js".white);
  });

  //generte README.md
  fs.writeFile("README.md", `

  ___________
  # ANGULAR-1.5-CLI
  ###### created by  Andrew Wormald

  ### Installation:


  npm install angular-1.5-cli -g

  You need to install this globally (aka using -g at the end) in order for this to work efficiently and enhance your experience.

  ___________

  ### Commands:

  #### Generate Project:

  gen new {{PROJECT NAME}}
  // Generates a new project using scss styling

  gen new {{PROJECT NAME}} --style:css

   // Generates a new project using css styling



  #### Generate Component:
  Make sure that you are at the base of the project directory

  gen {{COMPONENT NAME}}

  // Generates a new component using scss styling



  gen {{COMPONENT NAME}} --style:css

  // Generates a new component using css styling

  ___________
` , function(err) {
      if(err) {
          return console.log(` ❌  failed to generate due to error:  ${err}`);
      }
      console.log(" 🎁  created: ".cyan + "README.md".white);
  });

  fs.writeFile('spec.bundle.js', `/*
 * When testing with Webpack and ES6, we have to do some
 * preliminary setup. Because we are writing our tests also in ES6,
 * we must transpile those as well, which is handled inside
 * 'karma.conf.js' via the 'karma-webpack' plugin. This is the entry
 * file for the Webpack tests. Similarly to how Webpack creates a
 * 'bundle.js' file for the compressed app source files, when we
 * run our tests, Webpack, likewise, compiles and bundles those tests here.
*/

import angular from 'angular';

// Built by the core Angular team for mocking dependencies
import mocks from 'angular-mocks';

// We use the context method on 'require' which Webpack created
// in order to signify which files we actually want to require or import.
// Below, 'context' will be a/an function/object with file names as keys.
// Using that regex, we scan within 'client/app' and target
// all files ending with '.spec.js' and trace its path.
// By passing in true, we permit this process to occur recursively.
let context = require.context('./client/app', true, /\\.spec\\.js/);

// Get all files, for each file, call the context function
// that will require the file and load it here. Context will
// loop and require those spec files here.
context.keys().forEach(context);
`, function(err) {
    if(err) {
        return console.log(` ❌  failed to generate due to error:  ${err}`);
    }
    console.log(" 🎁  created: ".cyan + "spec.bundle.js".white);
  });


// generate karma file
  fs.writeFile('karma.conf.js', `module.exports = function(config) {
config.set({
  basePath: '',
  frameworks: ['jasmine'],
  files: [{
    pattern: 'spec.bundle.js',
    watched: false
  }],
  exclude: [],
  plugins: [
    require("karma-jasmine"),
    require("karma-phantomjs-launcher"),
    require("karma-spec-reporter"),
    require("karma-sourcemap-loader"),
    require("karma-webpack")
  ],
  preprocessors: {
    'spec.bundle.js': ['webpack', 'sourcemap']
  },
  webpack: {
    devtool: 'inline-source-map',
    module: {
      loaders: [{
        test: /\\.js/,
        exclude: [/app\\/lib/, /node_modules/],
        loader: 'babel'
      }, {
        test: /\\.html/,
        loader: 'raw'
      }, {
        test: /\\.styl$/,
        loader: 'style!css!stylus'
      }, {
        test: /\\.scss$/,
        loaders: ['style', 'css', 'sass']
      }]
    }
  },
  webpackServer: {
    noInfo: true // prevent console spamming when running in Karma!
  },
  reporters: ['spec'],
  port: 9876,
  colors: true,
  logLevel: config.LOG_INFO,
  autoWatch: false,
  browsers: ['PhantomJS'],
  singleRun: true
});
};
`, function(err) {
    if(err) {
        return console.log(` ❌  failed to generate due to error:  ${err}`);
    }
    console.log(" 🎁  created: ".cyan + "karma.conf.js".white);
  });



  //generate package.json
  fs.writeFile("package.json", `{
  "name": "${argument3}",
  "version": "0.0.1",
  "description": "Boilerplate generated by Angular-1.5-cli.",
  "main": "index.js",
  "dependencies": {
    "angular": "1.5.7",
    "angular-animate": "1.5.7",
    "angular-mocks": "1.5.7",
    "angular-ui-router": "^0.3.1",
    "bootstrap-css-only": "3.3.6",
    "lodash": "^4.13.1",
    "normalize.css": "4.1.1"
  },
  "devDependencies": {
    "angular-mocks": "1.5.7",
    "babel-core": "6.10.4",
    "babel-loader": "6.2.4",
    "babel-preset-es2015": "^6.9.0",
    "browser-sync": "2.13.0",
    "browser-sync-webpack-plugin": "^1.1.4",
    "css-loader": "^0.23.1",
    "file-loader": "0.9.0",
    "fs-walk": "0.0.1",
    "gulp": "3.9.1",
    "gulp-rename": "1.2.2",
    "gulp-template": "4.0.0",
    "html-webpack-plugin": "^2.28.0",
    "jasmine": "2.4.1",
    "jasmine-core": "2.4.1",
    "karma": "1.1.0",
    "karma-jasmine": "1.0.2",
    "karma-phantomjs-launcher": "1.0.1",
    "karma-sourcemap-loader": "0.3.7",
    "karma-spec-reporter": "0.0.26",
    "karma-webpack": "1.7.0",
    "less": "^2.7.1",
    "less-loader": "^2.2.3",
    "ng-annotate-loader": "0.1.0",
    "node-libs-browser": "1.0.0",
    "node-sass": "^4.4.0",
    "phantomjs-prebuilt": "2.1.7",
    "raw-loader": "0.5.1",
    "run-sequence": "1.2.1",
    "sass-loader": "^4.1.1",
    "style-loader": "^0.13.1",
    "url-loader": "0.5.7",
    "webpack": "1.13.1",
    "webpack-dev-server": "^1.16.3",
    "webpack-stream": "3.2.0",
    "yargs": "4.7.1"
  },
  "scripts": {
    "start": "webpack && webpack-dev-server --content-base client/ --hot --inline",
    "serve": "webpack && webpack-dev-server --content-base client/ --hot --inline",
    "create Component": "gen comp"
  },
  "keywords": [
    "angular",
    "webpack",
    "es6"
  ],
  "repository": {
    "type": "git",
    "url": "https://github.com/SwiftySpartan/Angular-1.5-cli"
  },
  "author": "Andrew Wormald",
  "license": "MIT"
}` , function(err) {
      if(err) {
          return console.log(` ❌  failed to generate due to error:  ${err}`);
      }
      console.log(" 🎁  created: ".cyan + "package.json".white);
  });

  //generate .bablerc
  fs.writeFile(".babelrc", `{
    "presets": [ "es2015"]
  }` , function(err) {
      if(err) {
          return console.log(` ❌  failed to generate due to error:  ${err}`);
      }
      console.log(" 🎁  created: ".cyan + ".bablerc".white);
  });

  // generate client directory
  mkdirp("client", function (err) {
    //within this directory create all the sub scripts (e.g. app.component.html)
    process.chdir("client"),

    mkdirp("assets/img", function (err) {
      console.log(" 🎁  created: ".cyan + "client/assets".white);
      console.log(" 🎁  created: ".cyan + "client/assets/img".white);
    });

    //generate favicon.jpg using base 64
   data = 'data:image/png;base64,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';

    function decodeBase64Image(dataString) {
      var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
        response = {};
      if (matches.length !== 3) {
        return new Error('Invalid input string');
      }
      response.type = matches[1];
      response.data = new Buffer(matches[2], 'base64');
      return response;
    }
    imageBuffer = decodeBase64Image(data);

    fs.writeFile('favicon.ico', imageBuffer.data, function(err) {
      if(err) {
          return console.log(` ❌  failed to generate due to error:  ${err}`);
      }
      console.log(" 🎁  created: ".cyan + "favicon.png".white);
    });

      //generate index.ejs file
      fs.writeFile(`index.ejs`,`<!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="initial-scale=1, maximum-scale=1, user-scalable=no, width=device-width">
    <title><%- htmlWebpackPlugin.options.pkg.title %></title>
</head>
<body ng-app="app" ng-strict-di ng-cloak>
    <app>
        Loading...
    </app>
</body>
<!-- {%= o.htmlWebpackPlugin.options.pkg.name + ' v' + o.htmlWebpackPlugin.options.pkg.version + ' built on ' + new Date() %} -->
</html>`, function(err){

          if(err) {
              return console.log(` ❌  failed to generate due to error:  ${err}`);
          }
          console.log(" 🎁  created: ".cyan + "index.ejs".white);

      });


    // generate index.html
    fs.writeFile("index.html", `
    <!doctype html>
      <html lang="en">
        <head>
          <meta charset="utf-8">
          <title>Welcome | Angular-1.5-cli</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <meta name="mobile-web-app-capable" content="yes">
          <meta name="apple-mobile-web-app-capable" content="yes">
          <meta name="apple-mobile-web-app-status-bar-style" content="black">
          <meta name="description" content="A cli for Angular 1.5">
          <link rel="icon" href="favicon.jpg">
          <base href="/">
        </head>
        <body ng-app="app" ng-strict-di ng-cloak>

          <app>
            Loading...
          </app>

          <script src="bundle.js"></script>
        </body>
      </html>
  ` , function(err) {
        if(err) {
            return console.log(` ❌  failed to generate due to error:  ${err}`);
        }
        console.log(" 🎁  created: ".cyan + "index.html".white);
    });

    mkdirp("app/components", function (err) {
      if (err) console.error(err)
      else
      process.chdir("app"),

      //build components.js
      fs.writeFile("components/components.js", `
        import angular from 'angular';

        const ComponentsModule = angular.module('app.components', [

      ]);

      export default ComponentsModule;
` , function(err) {
          if(err) {
              return console.log(` ❌  failed to generate due to error:  ${err}`);
          }
          console.log(" 🎁  created: ".cyan + "app/components/components.js".white);
      });


      //build component.html
      fs.writeFile(`${scriptName}.component.html`, `<link href="https://fonts.googleapis.com/css?family=Open+Sans+Condensed:300" rel="stylesheet">
      <div class="container">
    <img src="https://raw.githubusercontent.com/SwiftySpartan/Angular-1.5-cli/master/canvas1.png" class=".img-responsive center-block">
    <p>Angular-1.5-cli</p>
</div>
<div class="container-fluid main">
  <div class="col-md-1 littleGuy">
    <h1>Welcome</h1>
    <p>
      Welcome to Angular-1.5-cli! We hope you enjoy the CLI that will aid you in effecient web app development.
    </p>
  </div>
  <div class="col-md-1 littleGuy">
    <h1>Commands</h1>
    <p>Generate Project:

gen new {{PROJECT NAME}}<br>
Generates a new project using scss styling <br><br>

gen new {{PROJECT NAME}} --style:css <br>
Generates a new project using css styling <br><br>

gen -c {{COMPONENT NAME}} <br>
Generates a new component using scss styling <br><br>

gen -c {{COMPONENT NAME}} --style:css <br>
Generates a new component using css styling <br><br>
</p>
  </div>
  <div class="col-md-1 littleGuy">
    <h1>Help</h1>
    <p>
      gen h <br>
      gen -h <br>
      gen help <br>
      gen --help <br>
    </p>
  </div>
  <div class="col-md-1 littleGuy">
    <h1>Issues</h1>
    <p>
        Please report any issues on github: <br>
        https://github.com/SwiftySpartan/Angular-1.5-cli/issues
    </p>
  </div>
</div>
` , function(err) {
          if(err) {
              return console.log(` ❌  failed to generate due to error:  ${err}`);
          }
          console.log(" 🎁  created: ".cyan + "client/".white + scriptName.white + ".component.html".white);
      });

      //build scss || css styling scripts
      if (argument3 === "--style:css" || argument4 === "--style:css") {
      // build component.css
      fs.writeFile(scriptName +".component.css", `

body {
        background-color: #212121;
        color: white;
        font-size: 38px;
}

.container {
  display: block;
  width: 100%;
}

.container p {
  text-align: center;
  font-family: 'Open Sans Condensed', sans-serif;
}


.main{
background-color: #C3002F;
}
.main .littleGuy{
    background-color: #DD0031;
    width: 300px;
    height: 350px;
    position: relative;
    margin-left: 30px;
    margin-top: 30px;
    margin-bottom: 30px;
    box-shadow: 5px 5px 5px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    display: block;
    text-overflow: ellipsis;
}

.main .littleGuy h1 {
  font-size: 20px;
  font-family: 'Open Sans Condensed', sans-serif;
}

.main .littleGuy p {
  font-size: 17px;
  font-family: 'Open Sans Condensed', sans-serif;
}
`, function(err) {
          if(err) {
              return console.log(` ❌  failed to generate due to error:  ${err}`);
          }
          console.log(" 🎁  created: ".cyan + "client/".white + scriptName.white + ".component.css".white);
      });
      }else{
      // build component.scss
      fs.writeFile(scriptName +".component.scss", `@import url('https://fonts.googleapis.com/css?family=Open+Sans+Condensed:300');
@import url('https://fonts.googleapis.com/css?family=Titillium+Web:700');

body {
        background-color: #212121;
        color: white;
        font-size: 38px;
      }

.container {
  display: block;
  width: 100%;
  p {
    text-align: center;
    font-family: 'Open Sans Condensed', sans-serif;
  }
}
.main{
background-color: #C3002F;

  .littleGuy{
    background-color: #DD0031;
    width: 300px;
    height: 350px;
    position: relative;
    margin-left: 30px;
    margin-top: 30px;
    margin-bottom: 30px;
    box-shadow: 5px 5px 5px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    display: block;
    text-overflow: ellipsis;
    h1 {
      font-size: 20px;
      font-family: 'Open Sans Condensed', sans-serif;

    }

    p {
      font-size: 17px;
      font-family: 'Open Sans Condensed', sans-serif;
    }
  }
}
`, function(err) {
          if(err) {
              return console.log(` ❌  failed to generate due to error:  ${err}`);
          }
          console.log(" 🎁  created: ".cyan + "client/".white + scriptName.white + ".component.scss".white);
      });
      }


      //build component.js
      if (argument3 === "--style:css" || argument4 === "--style:css") {
      // build component.js with import of css folder
      fs.writeFile(scriptName +".component.js", `
      import template from './app.component.html';
      import './app.component.scss';

      const AppComponent = {
        template
      };

      export default AppComponent;
      `, function(err) {
          if(err) {
              return console.log(` ❌  failed to generate due to error:  ${err}`);
          }
          console.log(" 🎁  created: ".cyan + "client/".white + scriptName.white + ".component.js".white);
      });
      }else{
      // build component.js with import of scss folder
      fs.writeFile(scriptName +".component.js", `
      import template from './app.component.html';
      import './app.component.scss';

      const AppComponent = {
        template
      };

      export default AppComponent;
      `, function(err) {
          if(err) {
              return console.log(` ❌  failed to generate due to error:  ${err}`);
          }
          console.log(" 🎁  created: ".cyan + "client/".white + scriptName.white + ".component.js".white);
      });
      }

      //build module.js
      fs.writeFile(scriptName +".module.js", `
      import 'bootstrap-css-only';
      import 'normalize.css';
      import angular from 'angular';
      import appComponent from './app.component';;
      import ComponentsModule from './components/components';

      angular.module('app', [
          ComponentsModule.name
        ])
        .component('app', appComponent);
        `, function(err) {
          if(err) {
              return console.log(` ❌  failed to generate due to error:  ${err}`);
          }
          console.log(" 🎁  created: ".cyan + "client/".white + scriptName.white + ".module.js".white);
      });

    });

  });
  //making client directory and sub scripts should be last in the list as then you do not need to go back up a level in the directory ladder
});
//argument 4 is now the styling order


}else if (value === '-c'){

    //go to components directory
    const rootBase = __dirname

    process.chdir(`./client/app/components`);
    // GEN COMPONENT SCRIPT
    componentsArray = [];
    genArr = [];



    function camelize(str) {
        return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(letter, index) {
            return index == 0 ? letter.toLowerCase() : letter.toUpperCase();
        }).replace(/\s+/g, '');
    }

    value = camelize(`${value}`)
    argument3 = camelize(`${argument3}`)
    argument4 = camelize(`${argument4}`)

    // sync app.component with updates
    fs.readdir(process.cwd(), function(err, items) {
        genArr = items;
        generateDirectArray(genArr);
    });


    function generateDirectArray(items) {
        for (var i=0; i<items.length; i++) {
            if (isDirectory(items[i])){
            }else{
                componentsArray.push(items[i]);
            }
        }
        importStringGenerator();
    }

    function isDirectory(inputString) {
        var str = inputString;
        var patt = new RegExp("[.]");
        var res = patt.test(str);
        return res;
    }

    String.prototype.capitalizeFirstLetter = function() {
        return this.charAt(0).toUpperCase() + this.slice(1);
    }

    function importStringGenerator(){
        componentsArray.push(`${argument3}`);
        genString = "";
        for (var i=0; i<componentsArray.length; i++) {
            genString = genString + `    import ${componentsArray[i].capitalizeFirstLetter()}Module from './${componentsArray[i]}/${componentsArray[i]}.module';\r`
        }
        listString = "";
        for (var i=0; i<componentsArray.length; i++) {

            // check if last in list in order to not include comma
            if (i === (componentsArray.length - 1)){
                listString = listString + `     ${componentsArray[i].capitalizeFirstLetter()}Module` + `.name \r`
            }else{
                listString = listString + `     ${componentsArray[i].capitalizeFirstLetter()}Module` + '.name, \r'
            }

        }



        fs.writeFile("components.js", `
    import angular from 'angular';
${genString}

    const ComponentsModule = angular.module('app.components',[
${listString}
    ]);

    export default ComponentsModule;

    `, function(err) {
            if(err) {
                return console.log(` ❌  failed to update due to error:  ${err}`);
            }
            console.log(" 🔰  updated: ".cyan + "components.js".white);
        });
    }


    mkdirp(argument3, function (err) {
        console.log("Generating Component...".white)
        if (err) console.error(err)
        else
            process.chdir(argument3),

                //build component.html
                fs.writeFile(argument3 +".component.html", `<h1> ${argument3} works! </h1>` , function(err) {
                    if(err) {
                        return console.log(` ❌  failed to generate due to error:  ${err}`);
                    }
                    console.log(" 🎁  created: ".cyan + argument3.white + ".component.html".white);
                });

        //build scss || css styling scripts
        if (argument3 === "--style:css" || argument4 === "--style:css") {
            // build component.css
            fs.writeFile(argument3 +".component.css", "", function(err) {
                if(err) {
                    return console.log(` ❌  failed to generate due to error:  ${err}`);
                }
                console.log(" 🎁  created: ".cyan + argument3.white + ".component.css".white);
            });
        }else{
            // build component.scss
            fs.writeFile(argument3 +".component.scss", "", function(err) {
                if(err) {
                    return console.log(` ❌  failed to generate due to error:  ${err}`);
                }
                console.log(" 🎁  created: ".cyan + argument3.white + ".component.scss".white);
            });
        }


        //build component.js
        fs.writeFile(argument3 +".component.js", `import template from './${argument3}.component.html';
        import controller from './${argument3}.controller.js';
        import './${argument3}.component.scss';

        let ${argument3}Component = {
          restrict: 'E',
          bindings: {},
          template,
          controller,
          controllerAs: '${argument3}Controller'
        };
        export default ${argument3}Component;`, function(err) {
            if(err) {
                return console.log(` ❌  failed to generate due to error:  ${err}`);
            }
            console.log(" 🎁  created: ".cyan + argument3.white + ".component.js".white);
        });

        //build module.js
        fs.writeFile(argument3 +".module.js", `import angular from 'angular';
import ${argument3}Component from './${argument3}.component';

const ${argument3}Module = angular.module('${argument3}', [])
  .component('${argument3}', ${argument3}Component);
export default ${argument3}Module;`, function(err) {
            if(err) {
                return console.log(` ❌  failed to generate due to error:  ${err}`);
            }
            console.log(" 🎁  created: ".cyan + argument3.white + ".module.js".white);
        });

        //build controller.js
        fs.writeFile(argument3 +".controller.js", `class ${argument3}Controller {
    constructor() {
      this.name = '${argument3}';
    }
  }

  export default ${argument3}Controller;`, function(err) {
            if(err) {
                return console.log(` ❌  failed to generate due to error:  ${err}`);
            }
            console.log(" 🎁  created: ".cyan + argument3.white + ".controller.js".white);
        });
    });



}else if (value === 'help' || value === '-help' || value === '--help' || value === '-h'){
  // provide user with help
  console.log(`
    - gen new {{PROJECT NAME}}

    - gen new {{PROJECT NAME}} --style:css
        The default styling is set to SCSS.

    - gen -c {{COMPONENT NAME}} --style:css
        The default styling is set to SCSS.

    - gen -c {{COMPONENT NAME}}

    - gen v
    - gen -v
    - gen version
    - gen --version
        This reveals the current version number

    - gen h
    - gen -h
    - gen help
    - gen --version
        This reveals the Angular-1.5-cli command list
    `);
}else if (value === 'v' || value === 'version' || value === '-v' || value === '--version'){
  //provide user with version number
  console.log(packagejson.version);
}else if (value === "serve" || value ==="comp") {
  if (value === "serve"){
    console.log('serving angular 1.5 app...');
    cmd.get(
        `
                webpack && webpack-dev-server --content-base client/
            `,
        function(data){

        }
    );

  }else if (value === "comp"){

    // user chose component
    prompt.start();

    prompt.get([{
        name: 'name',
        required: true
    }], function (err, result) {
        //
        // Log the results.
        //
        var projectName = result.name
        console.log(`Would you like to use 'scss or css'?`);
        prompt.get([{
            name: 'styling',
            required: true
        }], function (err, result) {
            //
            // Log the results.
            //
            var stylingVar = '';
            if (result.styling === 'css'){
                stylingVar = '--style:css'
            }else{
                stylingVar = '--style:scss'
            }
            console.log(`Generating component: ${projectName}`);

            value = '-c';
            argument3 = projectName;
            argument4 = stylingVar;

            //
            //re-execute genScript with new values
            genScript();
            //
            //

        });

    });
  }
}else{
  //promt user to find out what they want to generate
  console.log(`You can always type 'gen new {{PROJECT NAME}} for a new project or 'gen -c {{COMPONENT NAME}}'`.white);
  prompt.start();

  console.log(`Would you like to generate a 'project' or 'component' ?`.red);
  prompt.get([{
    name: 'type',
    required: true
  }], function (err, result) {
  //
  // Log the results.
  //
  if (result.type === `project` || result.type === `Project`) {
    // user chose project
    prompt.start();

    prompt.get([{
      name: 'name',
      required: true
    }], function (err, result) {
    //
    // Log the results.
    //
    var projectName = result.name
    console.log(`Would you like to use 'scss or css'?`);
    prompt.get([{
      name: 'styling',
      required: true
    }], function (err, result) {
    //
    // Log the results.
    //
    var stylingVar = '';
    if (result.styling === 'css'){
      stylingVar = '--style:css'
    }else{
      stylingVar = '--style:scss'
    }
    console.log(`Generating project: ${projectName}`);

     value = 'new';
     argument3 = projectName;
     argument4 = stylingVar;


    //
    //re-execute genScript with new values
    genScript();
    //
    //

    });
  });
}else if (result.type === `component` || result.type === `Component`){
    // user chose component
    prompt.start();

    prompt.get([{
      name: 'name',
      required: true
    }], function (err, result) {
    //
    // Log the results.
    //
    var projectName = result.name
     console.log(`Would you like to use 'scss or css'?`);
     prompt.get([{
       name: 'styling',
       required: true
     }], function (err, result) {
     //
     // Log the results.
     //
     var stylingVar = '';
     if (result.styling === 'css'){
       stylingVar = '--style:css'
     }else{
       stylingVar = '--style:scss'
     }
     console.log(`Generating component: ${projectName}`);

      value = '-c';
      argument3 = projectName;
      argument4 = stylingVar;

     //
     //re-execute genScript with new values
     genScript();
     //
     //

     });

  });
  }else{
    console.log(`Please try again. Unfortunately I do not understand what you would like me to do for you...`.red);
  }
});
}
//end of genScript
};
