// *****************************************************************************
// Copyright 2013-2024 Aerospike, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License")
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// *****************************************************************************

'use strict'

/* eslint-env mocha */
/* global expect */

import Aerospike, { GeoJSON as GJ, Key as K, Client as Cli, RecordMetadata,  WritePolicy, AerospikeBins, AerospikeRecord, AerospikeError } from 'aerospike';

import { expect } from 'chai'; 
import * as helper from './test_helper';

const Key: typeof K = Aerospike.Key
const GeoJSON: typeof GJ = Aerospike.GeoJSON

describe('Aerospike.GeoJSON', function () {
  context('GeoJSON class #noserver', function () {
    const subject: GJ = new GeoJSON({ type: 'Point', coordinates: [103.913, 1.308] })

    describe('constructor', function () {
      it('returns a new GeoJSON value when called as an Object constructor', function () {
        expect(new GeoJSON({ type: 'Point', coordinates: [103.913, 1.308] })).to.be.instanceof(GeoJSON)
      })
      /*
      it('returns a new GeoJSON value when called as function', function () {
        expect(GeoJSON({ type: 'Point', coordinates: [103.913, 1.308] })).to.be.instanceof(GeoJSON)
      })
      */
      it('parses a GeoJSON string', function () {
        expect(new GeoJSON('{"type": "Point", "coordinates": [103.913, 1.308]}')).to.be.instanceof(GeoJSON)
      })
      /*
      it('throws a type error if passed an invalid GeoJSON value', function () {
        const fn: function = () => new GeoJSON(45)
        expect(fn).to.throw(TypeError)
      })
      */
    })

    describe('#value()', function () {
      it('returns the value as a JSON object', function () {
        expect(subject.value()).to.eql({ type: 'Point', coordinates: [103.913, 1.308] })
      })
    })

    describe('#toJSON()', function () {
      it('returns the GeoJSON value as a JSON object', function () {
        expect(subject.toJSON()).to.eql({ type: 'Point', coordinates: [103.913, 1.308] })
      })
    })

    describe('#toString()', function () {
      it('returns a string representation of the GeoJSON value', function () {
        expect(subject.toString()).to.equal('{"type":"Point","coordinates":[103.913,1.308]}')
      })
    })

    describe('GeoJSON.Point()', function () {
      it('returns the lat, lng as a GeoJSON point value', function () {
        const point: GJ = new GeoJSON({ type: 'Point', coordinates: [103.913, 1.308] })
        expect(new GeoJSON.Point(103.913, 1.308)).to.eql(point)
      })
    })

    describe('GeoJSON.Polygon()', function () {
      it('returns the coordinates as a GeoJSON polygon value', function () {
        const polygon: GJ = new GeoJSON({ type: 'Polygon', coordinates: [[[103.913, 1.308], [104.913, 1.308], [104.913, 1.408], [103.913, 1.408], [103.913, 1.408]]] })
        expect(new GeoJSON.Polygon([103.913, 1.308], [104.913, 1.308], [104.913, 1.408], [103.913, 1.408], [103.913, 1.408])).to.eql(polygon)
      })
    })

    describe('GeoJSON.Circle()', function () {
      it('creates a GeoJSON circle representation', function () {
        const circle: GJ = new GeoJSON({ type: 'AeroCircle', coordinates: [[-122.250629, 37.871022], 300] })
        expect(new GeoJSON.Circle(-122.250629, 37.871022, 300)).to.eql(circle)
      })
    })
  })

  describe('putting and getting GeoJSON values', function () {
    const client: Cli = helper.client
    const point: string = JSON.stringify({ type: 'Point', coordinates: [103.9139, 1.3030] })
    const geojson: GJ = new GeoJSON(point)
    const key: K = new Key(helper.namespace, helper.set, 'test/geojson')
    const meta: RecordMetadata = { ttl: 1000 }
    const policy: WritePolicy = new Aerospike.WritePolicy({
      exists: Aerospike.policy.exists.CREATE_OR_REPLACE
    })

    it('can put/get a GeoJSON bin value', function (done) {
      const record: AerospikeBins = { location: geojson }
      client.put(key, record, meta, policy, function (err?: AerospikeError) {
        if (err) throw err

        client.get(key, function (err?: AerospikeError, record?: AerospikeRecord) {
          if (err) throw err
          expect(record?.bins.location).to.equal(point)
          done()
        })
      })
    })

    it('can put/get a GeoJSON value in a list bin', function (done) {
      const record: AerospikeBins = { locations: [geojson, geojson] }
      client.put(key, record, meta, policy, function (err?: AerospikeError) {
        if (err) throw err

        client.get(key, function (err?: AerospikeError, record?: AerospikeRecord) {
          if (err) throw err
          expect(record?.bins.locations).to.eql([point, point])
          done()
        })
      })
    })

    it('can put/get a GeoJSON value in a map bin', function (done) {
      const record: AerospikeBins = { map: { location: geojson } }
      client.put(key, record, meta, policy, function (err?: AerospikeError) {
        if (err) throw err

        client.get(key, function (err?: AerospikeError, record?: AerospikeRecord) {
          if (err) throw err
          expect((record?.bins.map as { location: GJ }).location as GJ).to.equal(point)
          done()
        })
      })
    })
  })
})
