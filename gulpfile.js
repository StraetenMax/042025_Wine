//const mjml = require('gulp-mjml');
const gulp = require('gulp');
const mjml = require('mjml');
const rename = require('gulp-rename');
const through2 = require('through2');
const liveServer = require('live-server');
const nunjucksRender = require('gulp-nunjucks-render');
const data = require('gulp-data');
const fs = require('fs');
const path = require('path');

//Erreur mjml
function handleError (err) {
    console.log(err.toString());
    this.emit('end');
  }

//Tâche pour démarrer le serveur de développement
gulp.task('serve', function(){
    const params = {
        port: 8080,
        root: 'dist',
        open: true,
        file: 'layout.html',
        wait: 1000
    };
    liveServer.start(params);
});

//Tâche pour rendre le template Nunjucks avec les données JSON
gulp.task('nunjucks', function() {
    return gulp.src('src/njk/layout.njk')
        .pipe(data(function(){
            const readJSON = (filePath) => {
                try{
                    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
                } catch (err){
                    console.warn(`Fichier manquant: ${filePath}`);
                    return [];
                }
            };
            return{
                beers: readJSON('src/json/beers.json').beers,
            };
        }))
        .pipe(nunjucksRender({
            path: ['src/njk']
        }))
        .pipe(rename({ extname: '.mjml' }))
        .pipe(gulp.dest('src/mjml'));
});

//Tâche pour compiler MJML en HTML
gulp.task('mjml', function(){
    console.log('Starting mjml task...');
    return gulp.src('src/mjml/layout.mjml', { allowEmpty: true })
        .pipe(through2.obj(function(file, _, cb) {
            try {
                const { html } = mjml(file.contents.toString());
                file.contents = Buffer.from(html);
                cb(null, file);
            } catch (err) {
                handleError.call(this, err);
            }
        }))
        .pipe(rename({ extname: '.html' }))
        .pipe(gulp.dest('dist'))
        .on('end', () => console.log('MJML task completed.'));
});

//Tâche pour calculer le poids des fichiers dans le dossier dist
gulp.task('file-sizes', function(done){
    const directoryPath = path.join(__dirname, 'dist');
    fs.readdir(directoryPath, function(err, files){
        if(err){
            return console.log('Unable to scan directory: ' + err);
        }
        let pending = files.length;
        if(pending === 0) done();

        files.forEach(function(file){
            const filePath = path.join(directoryPath, file);
            fs.stat(filePath, function(err, stats){
                if(err){
                    return console.log('Unable to get file stats: ' + err);
                }
                if(stats.isFile()){
                    const fileSizeInkB = stats.size / 1024; 
                    console.log(`${file}: ${fileSizeInkB.toFixed(2)} ko`);
                }
                if (--pending === 0) done();
            });
        });
    });
});

//Tâche pour surveiller les fichiers
gulp.task('watch', function(){
    gulp.watch('src/njk/**/*.njk', gulp.series('nunjucks', 'mjml'));
    gulp.watch('src/json/**/*.json', gulp.series('nunjucks', 'mjml'));
});

//Tâche par défaut
gulp.task('default', gulp.series('nunjucks', 'mjml', gulp.parallel('serve', 'watch', 'file-sizes')));