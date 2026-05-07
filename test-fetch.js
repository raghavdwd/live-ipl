const { getProxyHeaders } = require('./utils/headers.util');

async function test() {
  try {
    const response = await fetch("https://pvupixvgqwqaoauyidur.supabase.co/functions/v1/proxy?url=https%3A%2F%2Fv.zgdyoqa.shop%2Fhls%2Fplll.m3u8&t=1778167578514", {
      headers: getProxyHeaders()
    });
    console.log('Status:', response.status);
    console.log('Headers:', response.headers);
    const text = await response.text();
    console.log('Body:', text.substring(0, 200));
  } catch (e) {
    console.error(e);
  }
}
test();
