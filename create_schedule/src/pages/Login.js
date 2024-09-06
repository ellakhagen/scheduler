import {Box, Flex, Text, FormControl, FormLabel, Input, InputGroup, 
    InputRightElement, Button, Image, useToast, Spinner} from '@chakra-ui/react'
import {ViewIcon, ViewOffIcon} from '@chakra-ui/icons'
import {useNavigate} from 'react-router-dom';
import {useState} from 'react'
import '../index.css';

function Login() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const toast = useToast();
    const navigate = useNavigate();

    const handlePasswordVisibility = () => setShowPassword(!showPassword)

    const handleSubmit = async() => {
        try{
            setLoading(true)
            const response = await fetch('http://localhost:3001/login', {
                method: 'POST',
                headers:{
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({email, password}),
            });
            const data = await response.text();
            setLoading(false)
            console.log(data)
            if(data.trim() === "Output: Incorrect"){
                toast({
                    title: "Incorrect username or password",
                    description: "Please try again",
                    status: 'error',
                    duration: 9000,
                    isClosable: true,
                    position: 'top-right',
                })
            }
            else{
                navigate('/home', {state: {email, password}});
            }  
        }
        catch{
            console.log("uh oh")
        }
    }
    return (
      <Flex>
        <Box w='45vw' h='100vh' bg='linear-gradient(to bottom left, #D5ECDD, #3E664C)'/>
        <Box position='absolute' w ='50%' h='84%' top='8%' borderRightRadius='20px' overflow='hidden'
            boxShadow='5px 10px 5px rgba(0, 0, 0, 0.25)'>
            <Image src='/images/CalPoly.jpg' objectFit='cover' w='100%' h='100%'/>
        </Box>
        <Flex w ='55vw' h='100vh' direction='column' align='stretch' p='15% 15% 20% 15%'
                justifyContent='center'>
            <Box>
                <Text w='100%' fontSize='30px' fontWeight='bold'fontFamily = 'Inter' mb='5px'>Welcome!</Text>
                <Text w='100%' fontSize='15px' fontWeight='bold' textColor='#A8A7A7' fontFamily='Inter'
                mb='30px'>
                    Log in to CalPoly account
                </Text>
                <FormControl mb='20px'>
                    <FormLabel fontSize='12px' fontWeight='light' fontFamily='Inter' textColor='#8D8D8D'>
                        Email/Username
                    </FormLabel>
                    <Input type='text'
                           onChange={(e)=>setEmail(e.target.value)}/>
                </FormControl>
                <FormControl mb='30px'>
                    <FormLabel  fontSize='12px' fontWeight='light' fontFamily='Inter' textColor='#8D8D8D'>
                        Password
                    </FormLabel>
                    <InputGroup>
                        <Input type={showPassword ? 'text' : 'password'}
                                onChange={(e)=>setPassword(e.target.value)}/>
                        <InputRightElement width="60px">
                                    <Button bg='none' size="sm" onClick={handlePasswordVisibility}>
                                        {showPassword ?  <ViewIcon /> : <ViewOffIcon />}
                                    </Button>
                        </InputRightElement>
                    </InputGroup>
                </FormControl>
                <Button bg='#567462' textColor='#FFFFFF' fontWeight='bold' fontSize='15px' 
                        w='100%' _hover={{bg:'#3B5D49'}} onClick={handleSubmit} isDisabled={loading}>
                    Login
                    {loading && (<Spinner size='sm' ml='5px'/>)}
                </Button>
            </Box>
        </Flex>
      </Flex>
    );
  }
  
  export default Login;
  