const {test}=require('node:test');
const assert=require('node:assert/strict');
const map=import('../meadow-map.js');

test('reference route enters left, follows the top loop before the lower-left and right loops, then exits bottom',async()=>{
 const m=await map,route=m.referenceRoutePixels,path=m.createMeadowPath();
 assert.deepEqual(route[0],[0,224]);assert.deepEqual(route.at(-1),[366,532]);
 const rightTop=route.findIndex(([x,y])=>x===414&&y===196),topLeft=route.findIndex(([x,y])=>x===280&&y===117),lowerLeft=route.findIndex(([x,y])=>x===138&&y===415),rightLoop=route.findIndex(([x,y])=>x===625&&y===327);
 assert(rightTop<topLeft&&topLeft<lowerLeft&&lowerLeft<rightLoop);
 assert.equal(path[0].x,-m.MAP_W/2);assert.equal(path.at(-1).z,m.MAP_H/2);assert(path.every(p=>p.x>=-m.MAP_W/2&&p.x<=m.MAP_W/2&&p.z>=-m.MAP_H/2&&p.z<=m.MAP_H/2));
});

test('both crossings retain distinct travel segments rather than turning into shortcuts',async()=>{
 const {referenceRoutePixels:r}=await map,crossings=[];
 for(let i=0;i<r.length-1;i++)for(let j=i+2;j<r.length-1;j++){
  const [a,b,c,d]=[r[i],r[i+1],r[j],r[j+1]],u=[b[0]-a[0],b[1]-a[1]],v=[d[0]-c[0],d[1]-c[1]],den=u[0]*v[1]-u[1]*v[0];if(!den)continue;
  const w=[c[0]-a[0],c[1]-a[1]],t=(w[0]*v[1]-w[1]*v[0])/den,s=(w[0]*u[1]-w[1]*u[0])/den;
  if(t>0&&t<1&&s>0&&s<1)crossings.push([a[0]+u[0]*t,a[1]+u[1]*t]);
 }
 assert.equal(crossings.length,2);assert(Math.abs(crossings[0][0]-280)<4&&Math.abs(crossings[0][1]-224)<4);assert(Math.abs(crossings[1][0]-279)<4&&Math.abs(crossings[1][1]-306)<4);
});
