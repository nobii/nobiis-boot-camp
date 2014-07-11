module.exports = function (grunt) {
    var path = require('path');
    var config = {};

    // dirs
    var JS = 'js';
    var JS_LIB = 'js/lib';
    var CSS = 'css';
    var SASS = 'sass';
    var IMG = 'img';
    var EJS = 'ejs';
    var TEST = 'test';

    var useEjs = true;

    // js library alias
    var alias = {
        $: 'jquery',
        _: 'underscore'
    };


    // dev config
    var DEV = 'dev';
    var devTasks = [];
    var devSitePath = '../';
    var devHttpPath = '/';

    // prod config
    var PROD = 'prod';
    var prodTasks = [];
    var prodSitePath = path.join(process.env.HOME, 'Desktop', 'nobiis-boot-camp');
    var prodHttpPath = '/';


    // basic
    {
        config.pkg =  grunt.file.readJSON('package.json');

        grunt.loadNpmTasks('grunt-contrib-copy');
        config.copy = {
            prod: {
                files: [
                    { // img
                        expand: true,
                        src: path.join(devSitePath, IMG, '*'),
                        dest: path.join(prodSitePath, IMG)
                    },
                    { // js lib
                        expand: true,
                        src: path.join(devSitePath, JS_LIB, '*'),
                        dest: path.join(prodSitePath, JS)
                    }
                ]
            }
        };
        prodTasks.push('copy:' + PROD);
    }

    // este watch
    {
        grunt.loadNpmTasks('grunt-este-watch');
        grunt.registerTask('watch', 'esteWatch');

        config.esteWatch = {
            options: {
                dirs: [],
                livereload: { enabled: false }
            }
        };
    }

    // release
    {
        grunt.loadNpmTasks('grunt-release');

        config.release = {
            options: {
                file: 'bower.json',
                npm: false
            }
        };
    }

    // auto deps
    {
        grunt.loadNpmTasks('grunt-auto-deps');
        config.auto_deps = {};
    
        var autoDepsDefaultConfig = {
            scripts: ['nobiisBootCamp'],
            loadPath: [JS + '/*.js', JS_LIB + '/*.js'],
            ignore: [],
            forced: [],
            wrap: true,
            alias: alias
        };

        // dev
        config.auto_deps[DEV] = util.clone(autoDepsDefaultConfig, {
            dest: path.resolve(devSitePath, JS)
        });
        devTasks.push('auto_deps:' + DEV);

        // prod
        config.auto_deps[PROD] = util.clone(autoDepsDefaultConfig, {
            dest: path.resolve(prodSitePath, JS)
        });
        prodTasks.push('auto_deps:' + PROD);
    
        // watch
        config.esteWatch.options.dirs.push(JS + '/*.js');
        config.esteWatch['js'] = function () { return 'auto_deps:' + DEV; };
    }
    
    
    // js lib copy
    (function () {
        var libs = [
            'bower_components/html5shiv/src/html5shiv.js'
        ];
    
        var files = [];
        libs.forEach(function (lib) {
            files.push({
                expand: true,
                flatten: true,
                src: lib,
                dest: path.resolve(devSitePath, JS_LIB)
            });
        });
        config.copy[DEV] = { files: files };
        devTasks.push('copy:' + DEV);
    })();
    
    
    // compass
    {
        grunt.loadNpmTasks('grunt-contrib-compass');
        config.compass = {};

        var compassDefaultConfig = {
            options: {
                sassDir: SASS
            }
        };

        // dev
        config.compass[DEV] = util.clone(compassDefaultConfig, {
            options: {
                cssDir                  : path.resolve(devSitePath, CSS),
                javascriptsDir          : path.resolve(devSitePath, JS),
                imagesDir               : path.resolve(devSitePath, IMG),
                generatedImagesPath     : path.resolve(devSitePath, IMG),
                httpImagesPath          : path.resolve(devHttpPath, IMG),
                httpGeneratedImagesPath : path.resolve(devHttpPath, IMG)
            }
        });
        devTasks.push('compass:' + DEV);

        // prod
        config.compass[PROD] = util.clone(compassDefaultConfig, {
            options: {
                cssDir                  : path.resolve(prodSitePath, CSS),
                javascriptsDir          : path.resolve(prodSitePath, JS),
                imagesDir               : path.resolve(prodSitePath, IMG),
                generatedImagesPath     : path.resolve(prodSitePath, IMG),
                httpImagesPath          : path.resolve(prodHttpPath, IMG),
                httpGeneratedImagesPath : path.resolve(prodHttpPath, IMG),
                environment             : 'production',
                outputStyle             : 'compressed'
            }
        });
        prodTasks.push('compass:' + PROD);
        
        // watch
        config.esteWatch.options.dirs.push(SASS + '/*.scss');
        config.esteWatch.options.dirs.push(SASS + '/**/*.scss');
        config.esteWatch['scss'] = function () { return 'compass:' + DEV; };
    
    }
    
    
    // ejs
    if (useEjs) {
        grunt.loadNpmTasks('grunt-simple-ejs');
        config.ejs = {};

        var ejsDefaultConfig = {
            templateRoot: EJS,
            template: ['*.ejs'],
            include: [
                'bower_components/ejs-head-modules/*.ejs',
                'bower_components/ejs-sns-modules/*.ejs',
                EJS + '/layout/*.ejs'
            ],
            silentInclude: true
        };

        // dev
        config.ejs[DEV] = util.clone(ejsDefaultConfig, {
            dest: devSitePath,
            options: [
                {
                    http_path : devHttpPath,
                    css_path  : path.resolve(devHttpPath, CSS),
                    js_path   : path.resolve(devHttpPath, JS ),
                    img_path  : path.resolve(devHttpPath, IMG)
                },
                'options.yaml'
            ]
        });
        devTasks.push('ejs:' + DEV);

        // prod
        config.ejs[PROD] = util.clone(ejsDefaultConfig, {
            dest: prodSitePath,
            options: [
                {
                    http_path : prodHttpPath,
                    css_path  : path.resolve(prodHttpPath, CSS),
                    js_path   : path.resolve(prodHttpPath, JS ),
                    img_path  : path.resolve(prodHttpPath, IMG)
                },
                'options.yaml'
            ]
        });
        prodTasks.push('ejs:' + PROD);
        
        // watch
        config.esteWatch.options.dirs.push(EJS + '/*.ejs');
        config.esteWatch.options.dirs.push(EJS + '/**/*.ejs');
        config.esteWatch['ejs'] = function () { return 'ejs:' + DEV; };
    
    }
    
    // html validation
    {
        grunt.loadNpmTasks('grunt-html-validation');
        config.validation = {
            options: {
            },
            files: {
                src: [ devSitePath + '*.html' ]
            }
        };
    }

    // server
    {
        grunt.loadNpmTasks('grunt-koko');
    
        config.koko = config.koko || {};
        config.koko[DEV] = {
            root: path.resolve(devSitePath, path.relative(devHttpPath, '/')),
            openPath: devHttpPath
        };
    
        grunt.registerTask('server', ['koko:' + DEV]);
    }
    
    // set as task
    grunt.registerTask(DEV, devTasks);
    grunt.registerTask(PROD, prodTasks);

    // init
    grunt.initConfig(config);
    grunt.registerTask('default', [DEV]);
};


var util = {
    clone: function (obj, opts) {
        opts = opts || {};

        var newObj = {};

        var key;
        for (key in obj) {
            if (typeof obj[key] == 'object') {
                if (isNaN(obj[key].length)) {
                    newObj[key] = util.clone(obj[key], opts[key]);
                } else {
                    newObj[key] = opts[key] || obj[key];
                }
            } else {
                newObj[key] = opts[key] || obj[key];
            }
        }
        for (key in opts) {
            if (!obj[key]) {
                newObj[key] = opts[key];
            }
        }

        return newObj;
    }
};

