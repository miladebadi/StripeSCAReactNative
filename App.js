/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useEffect, useState} from 'react';
import {Alert, Dimensions, Pressable, Text, TextInput, View} from 'react-native';
import stripe from 'tipsi-stripe';
import axios from 'axios';

const {width, height} = Dimensions.get('window');

const YOUR_PUBLISHABLE_KEY = '';

stripe.setOptions({
    publishableKey: YOUR_PUBLISHABLE_KEY,
    androidPayMode: 'test',
});

const url = 'http://192.168.3.104:3000';
const App = () => {
    let [cc, setCc] = useState('');
    let [clientSecret, setClientSecret] = useState(null);
    let [user, setUser] = useState(null);
    const setupIntent = async () => {
        console.log('INIT');
        let {data: userData} = await axios.get(url + '/');
        console.log(userData);
        setUser(userData);
        let {data} = await axios.get(url + '/setup');
        console.log(data);
        setClientSecret(data.client_secret);
    };
    const addCard = async () => {
        try {
            console.log(clientSecret);
            await stripe.confirmSetupIntent({
                clientSecret: clientSecret,
                returnURL: 'stripetest://result',
                paymentMethod: {
                    card: {
                        cvc: '242',
                        expMonth: 11,
                        expYear: 2040,
                        number: cc,
                    },
                },
            });
            alert('Added');
        } catch (err) {
            console.log(err);
        }
    };
    const purchase = async () => {
        Alert.alert(
            'Confirmation',
            'Are you sure?',
            [
                {
                    text: 'Cancel',
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel',
                },
                {
                    text: 'yes', onPress: async () => {
                        try {
                            let {data} = await axios.get(url + '/purchase');
                            if (data.success === false) {
                                alert(JSON.stringify(data.error));
                            } else {
                                try {
                                    let result = await stripe.confirmPaymentIntent({
                                        clientSecret: data.client_secret,
                                        paymentMethodId: data.payment_method,
                                        returnURL: 'stripetest://result',
                                    });


                                    // call job requested -> schedule
                                    alert(JSON.stringify({success: true, data: result}));
                                } catch (err) {
                                    alert(JSON.stringify({success: false, data: err}));
                                }
                            }
                            console.log(data);
                        } catch (err) {
                            console.log(err);
                        }
                    },
                },
            ],
            {cancelable: false},
        );
    };

    useEffect(() => {
        setupIntent();
    }, []);
    return (
        <View style={{width, height, justifyContent: 'center', padding: 20}}>
            <TextInput style={{backgroundColor: 'rgba(0,0,0,0.1)', width: '100%', height: 32}}
                       value={cc}
                       onChangeText={c => {
                           setCc(c);
                       }}/>
            <Pressable
                disabled={!cc}
                onPress={addCard}
                style={{
                    width: '100%',
                    padding: 10,
                    backgroundColor: 'blue',
                    marginTop: 30,
                }}>
                <Text style={{color: 'white'}}>Save My Card</Text>
            </Pressable>
            <Pressable
                onPress={purchase}
                style={{
                    width: '100%',
                    padding: 10,
                    backgroundColor: 'red',
                    marginTop: 30,
                }}>
                <Text style={{color: 'white'}}>Order Wash</Text>
            </Pressable>
        </View>
    );
};

export default App;
