'use strict';
const request = require('request');
const {
	LocalStorage
} = require('node-localstorage');//npm install node-localstorage
global.localStorage = new LocalStorage('./scratch');

const http = require('http');

/**
 * Read the documentation (https://strapi.io/documentation/3.0.0-beta.x/guides/controllers.html#core-controllers)
 * to customize this controller
 */
module.exports = {
	// GET /previewOne
	// strapi-hook-ejs: https://github.com/strapi/strapi/tree/master/packages/strapi-hook-ejs
	previewOne: async (ctx) => {
		const work = await strapi.services.work.findOne(ctx.params);
		http.get("http://pv.sohu.com/cityjson?ie=utf-8",function(datas){
				var str="";
				datas.on("datas",function(chunk){
						str+=chunk;//监听数据响应，拼接数据片段
				})
				datas.on("end",function(){
					localStorage.setItem("ips",str.toString());
				})
		})
		const obj = localStorage.getItem('ips').split('=')[1].split(';')[0];
		const oo = JSON.parse(obj);
		
// 		var app1=navigator.appVersion;
// 		console.log(app1);
		// console.log(localStorage.getItem("app"));
		
		
		const app = '手机';
		
		const ip = oo.cip;
		const city = oo.cname;
		if (work.attributes.status == '1') {
			const data = await strapi.services.data.create({
				app,
				work,
				ip,
				city
			});
		}
		return ctx.render('engine', {
			work
		});

	},
	
  submitForm: async (ctx) => {
    const work = await strapi.services.work.findOne(ctx.params);
    const user_id = ctx.request.header.referer.split('&')[1];
    const formData = ctx.request.body.fields;
    const workform = await strapi.services.workform.create({ form: formData, work, user_id });
    ctx.body = { message: 'success', status: 0 };
  },
  queryFormsOfOneWork: async (ctx) => {
    // move to util module or front-end
    function getUuidMap2Name(work) {
      const uuidMap2Name = {};
      work.pages.forEach(page => {
        page.elements.forEach(ele => {
          if (ele.name === 'lbp-form-input') {
            uuidMap2Name[ele.uuid] = ele.pluginProps.placeholder;
          }
          if (ele.name === 'lbp-form-radio-group') {
            uuidMap2Name[ele.uuid] = ele.pluginProps.aliasName;
          }
          if (ele.name === 'lbp-form-group') {
            uuidMap2Name[ele.uuid-1] = ele.pluginProps.userName;
            uuidMap2Name[ele.uuid +1] = ele.pluginProps.phoneNum;
          }
        });
      });
      return uuidMap2Name;
    }

		let work = await strapi.services.work.findOne(ctx.params);
		work = work.toJSON();

		// learn the query from: https://github.com/strapi/foodadvisor/blob/master/api/api/restaurant/controllers/Restaurant.js#L40
		// eslint-disable-next-line no-undef
		let formRecords = await Workform.query(qb => {
			qb.where('work', '=', work.id);
		}).fetchAll();
		formRecords = formRecords.toJSON();

		const uuidMap2Name = getUuidMap2Name(work);
		// eslint-disable-next-line require-atomic-updates
		return ctx.body = {
			uuidMap2Name,
			formRecords
		};
	},
	setAsTemplate: async (ctx) => {
		let work = await strapi.services.work.findOne(ctx.params);
		work = work.toJSON();

		// eslint-disable-next-line no-unused-vars
		const templateWork = await strapi.services.work.create();
		return strapi.services.work.update({
			id: templateWork.id
		}, {
			pages: work.pages,
			is_template: true,
			cover_image_url: work.cover_image_url
		});
	},
	useTemplate: async (ctx) => {
		let templateWork = await strapi.services.work.findOne(ctx.params);
		templateWork = templateWork.toJSON();

		// eslint-disable-next-line no-unused-vars
		const work = await strapi.services.work.create();
		return strapi.services.work.update({
			id: work.id
		}, {
			pages: templateWork.pages,
			is_template: false
		});
	},
	uploadPSD: async (ctx) => {
		const pageJSON = await strapi.services.work.parsePSD(ctx.request.body.files.file);
		// eslint-disable-next-line
		ctx.body = pageJSON;
	},
	corsProxy: async (ctx) => {
		ctx.body = request(ctx.query.url);
	}
};
