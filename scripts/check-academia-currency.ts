export {};
import assert from 'node:assert/strict';
async function main(){
 if(!process.env.LMS_TEST_SCHEMA)throw Error('Usa npm run test:lms');
 const sql=await(require('@/lib/crm/db') as typeof import('@/lib/crm/db')).crm();
 const {migrateAcademiaCurrency}=await import('@/lib/valux/currency-migration');
 const {CURRENCY,academyMoney,usdToHnlCents,hnlToUsdCents}=await import('@/lib/valux/money');
 assert.equal(CURRENCY,'HNL');assert.equal(usdToHnlCents(1500),40500);assert.equal(hnlToUsdCents(54000),2000);assert.match(academyMoney(40500),/405/);assert.ok(!academyMoney(40500).includes('$'));
 await sql`INSERT INTO lms_courses(id,slug,title,published,price_cents) VALUES ('hnl-course','hnl-course','Curso HNL',true,1500)`;
 await migrateAcademiaCurrency(sql);
 assert.equal(Number((await sql`SELECT price_cents FROM lms_courses WHERE id='hnl-course'`)[0].price_cents),40500);
 assert.ok((await sql`SELECT value FROM crm_meta WHERE key='academia_currency_backup_usd'`).length);
 await migrateAcademiaCurrency(sql);
 assert.equal(Number((await sql`SELECT price_cents FROM lms_courses WHERE id='hnl-course'`)[0].price_cents),40500);
 console.log('OK   HNL por defecto, conversión con respaldo y migración sin duplicar montos');
 let responseCurrency='usd';let sentCurrency='';let sentAmount='';
 const realFetch=globalThis.fetch;
 globalThis.fetch=(async(url:RequestInfo|URL,init?:RequestInit)=>{
  if(String(url).includes('api.resend.com'))return new Response('{"id":"test"}');
  if(String(url).includes('api.stripe.com')){
   if(init?.method==='POST'){const body=new URLSearchParams(String(init.body));sentCurrency=body.get('line_items[0][price_data][currency]')||'';sentAmount=body.get('line_items[0][price_data][unit_amount]')||'';return new Response(JSON.stringify({id:'cs_hnl',url:'https://checkout.stripe.com/test'}));}
   return new Response(JSON.stringify({payment_status:'paid',currency:responseCurrency,amount_total:40500}));
  }
  return realFetch(url,init);
 }) as typeof fetch;
 const {createStripeCheckout}=await import('@/lib/valux/stripe');
 await createStripeCheckout({amountCents:40500,description:'Curso',email:'hnl@example.test',successUrl:'http://localhost/ok',cancelUrl:'http://localhost/no',metadata:{}});
 assert.equal(sentCurrency,'hnl');assert.equal(sentAmount,'40500');
 const {fulfillStripeSession}=await import('@/lib/valux/fulfill');
 require('next/headers').headers=async()=>new Headers({host:'localhost'});
 await sql`INSERT INTO valux_intents(id,paypal_order_id,kind,item_id,buyer_name,buyer_email,amount_cents,months) VALUES ('hnl-intent','cs_hnl','curso','hnl-course','Prueba','hnl@example.test',40500,1)`;
 assert.equal(await fulfillStripeSession('cs_hnl'),null);
 responseCurrency='hnl';assert.ok(await fulfillStripeSession('cs_hnl'));
 console.log('OK   Stripe cobra lempiras y no entrega acceso con otra moneda');
 await sql`DELETE FROM crm_meta WHERE key='academia_currency'`;
 await assert.rejects(migrateAcademiaCurrency(sql),/operaciones existentes/);
 assert.equal(Number((await sql`SELECT price_cents FROM lms_courses WHERE id='hnl-course'`)[0].price_cents),40500);
 console.log('OK   una base con operaciones no se convierte ni se reetiqueta');
}
main().catch(e=>{console.error(e);process.exitCode=1;});
