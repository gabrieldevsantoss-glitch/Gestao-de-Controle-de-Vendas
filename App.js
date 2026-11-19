import { useState, useEffect } from 'react'
import {View,Text,TextInput,TouchableOpacity,StyleSheet,KeyboardAvoidingView,Platform,ActivityIndicator,FlatList} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

export default function App() {
  const [listaProdutos, setListaProdutos] = useState([])
  const [nomeProduto, setNomeProduto] = useState('')
  const [quantidade, setQuantidade] = useState('')
  const [mensagemErro, setMensagemErro] = useState('')
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    const carregar = async () => {
      try {
        const dados = await AsyncStorage.getItem('estoque')
        if (dados !== null) {
          setListaProdutos(JSON.parse(dados))
        }
      } catch (e) {
        setMensagemErro('Erro ao carregar os dados.')
      }
      setCarregando(false)
    }
    carregar()
  }, [])

  useEffect(() => {
    if (!carregando) {
      AsyncStorage.setItem('estoque', JSON.stringify(listaProdutos))
    }
  }, [listaProdutos])

  const adicionarProduto = () => {
    if (nomeProduto.trim() === '') {
      setMensagemErro('Digite o nome do produto.')
      return
    }

    const novoProduto = {
      id: Date.now().toString(),
      nome: nomeProduto.trim(),
      quantidade: parseInt(quantidade) || 0,
    }

    setListaProdutos([...listaProdutos, novoProduto])
    setNomeProduto('')
    setQuantidade('')
    setMensagemErro('')
  }

  const aumentar = (id) => {
    const novaLista = listaProdutos.map((item) =>
      item.id === id ? { ...item, quantidade: item.quantidade + 1 } : item
    )
    setListaProdutos(novaLista)
    setMensagemErro('')
  }

  const diminuir = (item) => {
    if (item.quantidade === 0) {
      setMensagemErro('Estoque de "' + item.nome + '" já está zerado.')
      return
    }
    const novaLista = listaProdutos.map((p) =>
      p.id === item.id ? { ...p, quantidade: p.quantidade - 1 } : p
    )
    setListaProdutos(novaLista)
    setMensagemErro('')
  }

  const remover = (id) => {
    setListaProdutos(listaProdutos.filter((item) => item.id !== id))
    setMensagemErro('')
  }

  if (carregando) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" color="white" />
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.titulo}>Controle de Estoque</Text>

      <View style={styles.divAddProduto}>
        <TextInput
          style={[styles.inputAddItem, styles.inputTemplate]}
          placeholder="Nome do Produto"
          onChangeText={setNomeProduto}
          value={nomeProduto}
        />

        <TextInput
          style={[styles.inputAddQnt, styles.inputTemplate]}
          placeholder="Qtd"
          keyboardType="numeric"
          onChangeText={setQuantidade}
          value={quantidade}
        />

        <TouchableOpacity style={styles.btnAdd} onPress={adicionarProduto}>
          <Text style={styles.textoBtnAdd}>Adicionar</Text>
        </TouchableOpacity>
      </View>

      {mensagemErro !== '' && <Text style={styles.erro}>{mensagemErro}</Text>}

      <FlatList
        style={styles.lista}
        data={listaProdutos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.cardProduto}>
            <View style={styles.cardInfo}>
              <Text style={styles.cardNome}>{item.nome}</Text>
              <Text style={styles.cardQtd}>Em estoque: {item.quantidade} un</Text>
            </View>

            <TouchableOpacity style={styles.botaoPequeno} onPress={() => diminuir(item)}>
              <Text style={styles.textoBotaoPequeno}>-</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.botaoPequeno} onPress={() => aumentar(item.id)}>
              <Text style={styles.textoBotaoPequeno}>+</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.botaoPequeno} onPress={() => remover(item.id)}>
              <Text style={styles.textoBotaoPequeno}>x</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#121212',
    flex: 1,
    paddingTop: 50,
  },
  centro: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titulo: {
    fontSize: 30,
    color: 'white',
    padding: 10,
    fontWeight: '800',
    fontFamily: 'sans-serif',
  },
  divAddProduto: {
    alignSelf: 'center',
    backgroundColor: '#444444',
    width: '95%',
    padding: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignContent: 'center',
    borderRadius: 10,
    gap: 10,
  },
  inputTemplate: {
    backgroundColor: 'white',
    height: 50,
    borderRadius: 10,
    margin: 2,
    padding: 10,
  },
  inputAddQnt: {
    width: 70,
    textAlign: 'center',
  },
  inputAddItem: {
    width: 250,
  },
  btnAdd: {
    backgroundColor: 'gray',
    height: 55,
    width: 335,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textoBtnAdd: {
    fontFamily: 'sans-serif',
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  erro: {
    color: '#ff5252',
    fontWeight: 'bold',
    marginTop: 10,
    paddingHorizontal: 15,
  },
  lista: {
    width: '95%',
    alignSelf: 'center',
    marginTop: 10,
  },
  cardProduto: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#444444',
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    gap: 8,
  },
  cardInfo: {
    flex: 1,
  },
  cardNome: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    fontFamily: 'sans-serif',
  },
  cardQtd: {
    color: '#cccccc',
    fontFamily: 'sans-serif',
  },
  botaoPequeno: {
    backgroundColor: 'gray',
    borderRadius: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textoBotaoPequeno: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
})