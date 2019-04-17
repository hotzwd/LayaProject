{
	"version":"LAYASCENE3D:01",
	"data":{
		"type":"Scene3D",
		"props":{
			"name":"MainScene",
			"ambientColor":[
				0.212,
				0.227,
				0.259
			],
			"lightmaps":[],
			"enableFog":false,
			"fogStart":0,
			"fogRange":300,
			"fogColor":[
				0.5,
				0.5,
				0.5
			]
		},
		"child":[
			{
				"type":"Sprite3D",
				"props":{
					"name":"主界面_秋1_待机",
					"active":true,
					"isStatic":false,
					"layer":0,
					"position":[
						0,
						0,
						0
					],
					"rotation":[
						0,
						0,
						0,
						-1
					],
					"scale":[
						1,
						1,
						1
					]
				},
				"components":[
					{
						"type":"Animator",
						"avatar":{
							"path":"Assets/Resource/主界面_秋1/主界面_秋1_待机-主界面_秋1_待机-主界面_秋1_待机Avatar.lav",
							"linkSprites":{}
						},
						"layers":[
							{
								"name":"Base Layer",
								"weight":0,
								"blendingMode":0,
								"states":[
									{
										"name":"Take 001",
										"clipPath":"Assets/Resource/主界面_秋1/主界面_秋1_待机-Take 001.lani"
									}
								]
							}
						],
						"cullingMode":0,
						"playOnWake":true
					}
				],
				"child":[
					{
						"type":"SkinnedMeshSprite3D",
						"props":{
							"name":"主界面-秋1_01",
							"active":true,
							"isStatic":false,
							"layer":0,
							"position":[
								-0.4536162,
								3.124939,
								-0.01315697
							],
							"rotation":[
								0.7071068,
								0,
								0,
								-0.7071067
							],
							"scale":[
								1,
								1,
								1
							],
							"rootBone":"Bone001",
							"boundBox":{
								"min":[
									-4.46878,
									-2.425014,
									-2.164481
								],
								"max":[
									4.807245,
									3.111287,
									2.672487
								]
							},
							"boundSphere":{
								"center":[
									0.1692328,
									0.3431362,
									0.254003
								],
								"radius":5.918013
							},
							"materials":[
								{
									"type":"Laya.BlinnPhongMaterial",
									"path":"Assets/Resource/主界面_秋1/主界面_秋1_待机.lmat"
								}
							],
							"meshPath":"Assets/Resource/主界面_秋1/主界面_秋1_待机-主界面-秋1_01.lm"
						},
						"components":[],
						"child":[]
					}
				]
			}
		]
	}
}