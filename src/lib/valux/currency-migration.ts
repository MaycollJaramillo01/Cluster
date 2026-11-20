import type { Sql } from '@/lib/crm/db';
import { USD_HNL_RATE } from './money';

export async function migrateAcademiaCurrency(sql: Sql) {
  // Un único cambio atómico: conserva el valor de los precios y guarda sus originales.
  await sql.query(`DO $migration$
  BEGIN
    PERFORM pg_advisory_xact_lock(hashtext('academia_currency_hnl'));
    IF EXISTS (SELECT 1 FROM crm_meta WHERE key = 'academia_currency' AND value = 'HNL') THEN RETURN; END IF;
    LOCK TABLE lms_courses, valux_products, valux_plans, valux_coupons, valux_people,
      valux_settings, valux_sales, valux_subscriptions, valux_transfers, valux_payouts,
      valux_intents, valux_donations IN SHARE ROW EXCLUSIVE MODE;
    IF EXISTS (SELECT 1 FROM valux_sales) OR EXISTS (SELECT 1 FROM valux_subscriptions)
      OR EXISTS (SELECT 1 FROM valux_transfers) OR EXISTS (SELECT 1 FROM valux_payouts)
      OR EXISTS (SELECT 1 FROM valux_intents) OR EXISTS (SELECT 1 FROM valux_donations)
    THEN RAISE EXCEPTION 'La conversión a HNL necesita conciliar las operaciones existentes'; END IF;
    INSERT INTO crm_meta(key, value) VALUES ('academia_currency_backup_usd', jsonb_build_object(
      'rate', ${USD_HNL_RATE}, 'at', now(),
      'courses', (SELECT jsonb_agg(jsonb_build_object('id',id,'price',price_cents,'bump',bump_cents,'upsell',upsell_cents)) FROM lms_courses),
      'products', (SELECT jsonb_agg(jsonb_build_object('id',id,'price',price_cents)) FROM valux_products),
      'plans', (SELECT jsonb_agg(jsonb_build_object('id',id,'price',price_cents)) FROM valux_plans),
      'coupons', (SELECT jsonb_agg(jsonb_build_object('code',code,'amount',amount_cents)) FROM valux_coupons),
      'contracts', (SELECT jsonb_agg(jsonb_build_object('id',id,'fee',contract_fee_cents)) FROM valux_people),
      'settings', (SELECT jsonb_agg(jsonb_build_object('id',id,'subscription',subscription_cents)) FROM valux_settings)
    )::text);
    UPDATE lms_courses SET price_cents=round(price_cents::numeric * ${USD_HNL_RATE}), bump_cents=round(bump_cents::numeric * ${USD_HNL_RATE}), upsell_cents=round(upsell_cents::numeric * ${USD_HNL_RATE});
    UPDATE valux_products SET price_cents=round(price_cents::numeric * ${USD_HNL_RATE});
    UPDATE valux_plans SET price_cents=round(price_cents::numeric * ${USD_HNL_RATE});
    UPDATE valux_coupons SET amount_cents=round(amount_cents::numeric * ${USD_HNL_RATE});
    UPDATE valux_people SET contract_fee_cents=round(contract_fee_cents::numeric * ${USD_HNL_RATE});
    UPDATE valux_settings SET subscription_cents=round(subscription_cents::numeric * ${USD_HNL_RATE});
    INSERT INTO crm_meta(key,value) VALUES ('academia_currency','HNL');
  END $migration$`);
}
