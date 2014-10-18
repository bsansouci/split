var LIVERELOAD_PORT = 35729,
    lrSnippet = require('connect-livereload')({ port: LIVERELOAD_PORT }),
    mountFolder = function( connect, dir ) {
      return connect.static(require('path').resolve(dir));
    };

module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    watch: {
      files: ["client/**/*.js"],
      livereload: {
        options: {
          livereload: LIVERELOAD_PORT
        },
        files: ["client/**/*.js"]
      }
    },
    connect: {
      options: {
        port: 8000,
        hostname: '0.0.0.0'
      },
      livereload: {
        options: {
          middleware: function( connect ) {
            return [
              lrSnippet,
              mountFolder(connect, 'client/')
            ];
          }
        }
      }
    },
    open: {
      server: {
        url: 'http://localhost:<%= connect.options.port %>'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-open');

  grunt.registerTask('server', function() {
    grunt.task.run([
      'connect:livereload',
      'open',
      'watch'
    ]);
  });

  grunt.registerTask('default', ['server']);
};
