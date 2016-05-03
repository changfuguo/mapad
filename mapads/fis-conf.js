
fis.set('namespace','common');

 
fis.set('project.files',['**','.**','.**/**'])
	.set('project.ignore',['**/_*.scss','.svn/**','fis-conf.js','BCLOUD','build.sh',"**.swp"])
	.set('pack',{
		'/static/js/mapad.js':[
			'/static/js/app/core.js',
			'/static/js/app/cookie.js',
			'/static/js/app/utils.js',
			'/static/js/app/url.js',
			'/static/js/app/adapter.js'
		]
	});

fis.match('*.js',{
	useHash: true,
	optimizer: fis.plugin('uglify-js', {})
});
