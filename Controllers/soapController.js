// Servicio SOAP de consulta del catálogo (complementa a la API REST).
// GET  /soap?wsdl  -> contrato WSDL del servicio
// POST /soap       -> recibe un sobre SOAP (XML) y responde otro sobre SOAP
const { isValidObjectId } = require('mongoose');
const Producto = require('../models/producto');

const NS = 'urn:hackeame:tienda';

const escapar = (v) =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const sobre = (cuerpo) => `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tns="${NS}">
  <soap:Body>
${cuerpo}
  </soap:Body>
</soap:Envelope>`;

const falla = (codigo, mensaje) =>
  sobre(`    <soap:Fault>
      <faultcode>soap:${codigo}</faultcode>
      <faultstring>${escapar(mensaje)}</faultstring>
    </soap:Fault>`);

const productoXml = (p) => `      <tns:producto>
        <tns:id>${p.id}</tns:id>
        <tns:nombre>${escapar(p.nombre)}</tns:nombre>
        <tns:categoria>${escapar(p.categoria || 'General')}</tns:categoria>
        <tns:precio>${p.precio}</tns:precio>
        <tns:stock>${p.stock}</tns:stock>
      </tns:producto>`;

const wsdl = (url) => `<?xml version="1.0" encoding="UTF-8"?>
<definitions name="TiendaService" targetNamespace="${NS}"
  xmlns="http://schemas.xmlsoap.org/wsdl/"
  xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/"
  xmlns:tns="${NS}" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <types>
    <xsd:schema targetNamespace="${NS}">
      <xsd:complexType name="Producto">
        <xsd:sequence>
          <xsd:element name="id" type="xsd:string"/>
          <xsd:element name="nombre" type="xsd:string"/>
          <xsd:element name="categoria" type="xsd:string"/>
          <xsd:element name="precio" type="xsd:decimal"/>
          <xsd:element name="stock" type="xsd:int"/>
        </xsd:sequence>
      </xsd:complexType>
      <xsd:element name="ListarProductos"><xsd:complexType/></xsd:element>
      <xsd:element name="ListarProductosResponse">
        <xsd:complexType><xsd:sequence>
          <xsd:element name="producto" type="tns:Producto" minOccurs="0" maxOccurs="unbounded"/>
        </xsd:sequence></xsd:complexType>
      </xsd:element>
      <xsd:element name="ObtenerProducto">
        <xsd:complexType><xsd:sequence><xsd:element name="id" type="xsd:string"/></xsd:sequence></xsd:complexType>
      </xsd:element>
      <xsd:element name="ObtenerProductoResponse">
        <xsd:complexType><xsd:sequence><xsd:element name="producto" type="tns:Producto"/></xsd:sequence></xsd:complexType>
      </xsd:element>
    </xsd:schema>
  </types>
  <message name="ListarProductosRequest"><part name="parameters" element="tns:ListarProductos"/></message>
  <message name="ListarProductosResponse"><part name="parameters" element="tns:ListarProductosResponse"/></message>
  <message name="ObtenerProductoRequest"><part name="parameters" element="tns:ObtenerProducto"/></message>
  <message name="ObtenerProductoResponse"><part name="parameters" element="tns:ObtenerProductoResponse"/></message>
  <portType name="TiendaPortType">
    <operation name="ListarProductos">
      <input message="tns:ListarProductosRequest"/><output message="tns:ListarProductosResponse"/>
    </operation>
    <operation name="ObtenerProducto">
      <input message="tns:ObtenerProductoRequest"/><output message="tns:ObtenerProductoResponse"/>
    </operation>
  </portType>
  <binding name="TiendaBinding" type="tns:TiendaPortType">
    <soap:binding style="document" transport="http://schemas.xmlsoap.org/soap/http"/>
    <operation name="ListarProductos">
      <soap:operation soapAction="${NS}#ListarProductos"/>
      <input><soap:body use="literal"/></input><output><soap:body use="literal"/></output>
    </operation>
    <operation name="ObtenerProducto">
      <soap:operation soapAction="${NS}#ObtenerProducto"/>
      <input><soap:body use="literal"/></input><output><soap:body use="literal"/></output>
    </operation>
  </binding>
  <service name="TiendaService">
    <port name="TiendaPort" binding="tns:TiendaBinding">
      <soap:address location="${url}"/>
    </port>
  </service>
</definitions>`;

const enviarXml = (res, status, xml) => res.status(status).type('text/xml; charset=utf-8').send(xml);

// GET /soap?wsdl
const contrato = (req, res) => {
  const url = `${req.protocol}://${req.get('host')}/soap`;
  if ('wsdl' in req.query) return enviarXml(res, 200, wsdl(url));
  res.json({ servicio: 'TiendaService (SOAP 1.1)', wsdl: `${url}?wsdl`, operaciones: ['ListarProductos', 'ObtenerProducto'] });
};

// POST /soap
const atender = async (req, res) => {
  const xml = typeof req.body === 'string' ? req.body : '';
  const operacion = xml.match(/<(?:[\w-]+:)?(ListarProductos|ObtenerProducto)[\s/>]/)?.[1];

  try {
    if (operacion === 'ListarProductos') {
      const productos = await Producto.find().sort({ createdAt: -1 });
      return enviarXml(res, 200, sobre(`    <tns:ListarProductosResponse>
${productos.map(productoXml).join('\n')}
    </tns:ListarProductosResponse>`));
    }

    if (operacion === 'ObtenerProducto') {
      const id = xml.match(/<(?:[\w-]+:)?id>\s*([^<\s]+)\s*</)?.[1];
      const producto = isValidObjectId(id) ? await Producto.findById(id) : null;
      if (!producto) return enviarXml(res, 404, falla('Client', 'Producto no encontrado'));
      return enviarXml(res, 200, sobre(`    <tns:ObtenerProductoResponse>
${productoXml(producto)}
    </tns:ObtenerProductoResponse>`));
    }

    enviarXml(res, 400, falla('Client', 'Operación no soportada. Usa ListarProductos u ObtenerProducto.'));
  } catch (error) {
    console.error('Error SOAP:', error);
    enviarXml(res, 500, falla('Server', 'Error interno del servicio'));
  }
};

module.exports = { contrato, atender };
