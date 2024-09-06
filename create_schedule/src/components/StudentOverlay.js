import {Box, Button, Text, Drawer, DrawerBody, Input, useToast,
    DrawerHeader, DrawerOverlay, DrawerContent, Flex, Spinner} from '@chakra-ui/react'
    import {AddIcon} from '@chakra-ui/icons'
    import {useState} from 'react'
    
    
    function StudentOverlay({isOpen, onClose, studentFile, setStudents, 
        setStudentFile, generatedStudentFile, setGeneratedStudentFile, 
        email, password, term, yourClasses, headless}){
        const [generating, setGenerating] = useState(false);
        const toast = useToast();
    
        async function generateStudentList(){
            setGenerating(true)
            toast({
                title: "Approve action with DUO two factor authentication.",
                status: 'success',
                duration: 9000,
                isClosable: true,
                position: 'bottom',
            })
            const response = await fetch('http://localhost:3001/get_students', {
                method: 'POST',
                headers:{
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({email, password, term, headless, yourClasses}),
            });
            console.log(response.status)
            if(response.status === 400){
                toast({
                    title: "Option not available for student search",
                    status: 'error',
                    duration: 9000,
                    isClosable: true,
                    position: 'bottom',
                })
                setGenerating(false);
                return;
            }
            if (!response.ok) {
                toast({
                    title: "An error occurred",
                    description: `Server returned status ${response.status}`,
                    status: 'error',
                    duration: 9000,
                    isClosable: true,
                    position: 'bottom',
                });
                setGenerating(false);
                return;
            }
    
            const file = await response.text()
            console.log(file)
            const isValid = checkFileContent(file)
    
            if(isValid){
                setGeneratedStudentFile(file)        }
            else{
                toast({
                    title: "File is not in correct format",
                    description: "Please try again",
                    status: 'error',
                    duration: 9000,
                    isClosable: true,
                    position: 'bottom',
                })
            }
            setGenerating(false)
    
        }
    
    
        function handleFileChange(event){
            const file= event.target.files[0];
            const reader = new FileReader();
            reader.onload = (e) => {
                const fileContent = e.target.result
                const isValid = checkFileContent(fileContent)
                if(isValid){
                    const parsed = JSON.parse(fileContent);
                    setStudentFile(parsed)
                }
                else{
                    toast({
                        title: "File is not in correct format",
                        description: "Please try again",
                        status: 'error',
                        duration: 9000,
                        isClosable: true,
                        position: 'bottom',
                    })
                }
            }
            reader.onerror = (e) => {
                console.error("File could not be read")
            }
    
            reader.readAsText(file);
        }
    
        
    
        function checkFileContent(file){
            try{
                const parsedContent = JSON.parse(file);
    
                if(typeof parsedContent !== 'object' || parsedContent === null){
                    throw new Error("Invalid format: Not an object");
                }
    
                for(const [key, value] of Object.entries(parsedContent)){
                    if (typeof key !== 'string'){
                        throw new Error(`Invalid key type: ${key} is not a string`);
                    }
                    if (typeof value !== 'object' || value === null){
                        throw new Error(`Invalid value for key "${key}": Expected an object`);
                    }
                }
    
                return true
            }
            catch(error){
                console.error(error)
                return false
            }
            
        }
    
        function handleContinue(){
            onClose()
            setStudents(true)
        }
    
        return(
            <Drawer placement='bottom' onClose={onClose} isOpen={isOpen}>
                <DrawerOverlay />
                <DrawerContent p='40px'>
                    <DrawerHeader pb='0px' pl='0' display='flex' justifyContent='space-between'>
                        <Text fontSize='30px'>Student Information</Text>
                        {studentFile || generatedStudentFile ? 
                        (<Button onClick={handleContinue} bg='#ECECEC'>
                            <Text textColor='#626161'>Continue</Text>
                        </Button>) : (<></>)}
                    </DrawerHeader>
                    <DrawerHeader borderBottomWidth='1px' textColor='#626161' pt='0px' pl='0px'>Generate new student list or upload existing list</DrawerHeader>
                    <DrawerBody pl='0px'>
                        <Flex justify="space-between" gap='40px' pt='40px'>
                            <Box flex='1' h='400px' bg='#F4F3F3' boxShadow='base' overflow='hidden' borderRadius='15px'>
                                <Box bg='#ECECEC' p='20px' h='100px'>
                                    <Text fontSize='20px' fontFamily='inter' textColor='#626161'>Upload</Text>
                                    <Text fontSize='15px' fontFamily='inter' textColor='#A2A2A2'>Should be in format {term.replace(/\s+/g, '')}StudentList.txt 
                                    if program has been run before.</Text>
                                </Box>
                                {studentFile ? 
                                (<Box w='100%' bg='rgba(91, 145, 90, 0.25)' p ='10px 20px 10px 20px'>
                                    <Text fontSize='15px' fontFamily='inter' textColor='#A2A2A2'>File successfully uploaded</Text>
                                </Box>) : 
                                (<></>)}
                                <Box h='100%' w='100%' justifyContent='center' alignItems='center' position='relative' display='flex'>
                                    <Input type='file' id='file' display='none' onChange={handleFileChange}/>
                                    <Button as='label' htmlFor='file' cursor='pointer' _hover={{bg:'none'}} bg='none'>
                                        <AddIcon boxSize='100px' color='gray' _hover={{color: 'gray.500'}} transform='translate(0%, -50%)'/>
                                    </Button>
                                </Box>
                            </Box>
                            <Box flex='1' h='400px' bg='#F4F3F3'  boxShadow='base' overflow='hidden' borderRadius='15px'>
                                <Box bg='#ECECEC' p='20px' h='100px'>
                                    <Text fontSize='20px' fontFamily='inter' textColor='#626161'>Generate</Text>
                                    <Text fontSize='15px' fontFamily='inter' textColor='#A2A2A2'>Will generate students for your classes in {term}</Text>
                                </Box>
                                {generatedStudentFile ? 
                                (<Box w='100%' bg='rgba(91, 145, 90, 0.25)' p ='10px 20px 10px 20px'>
                                    <Text fontSize='15px' fontFamily='inter' textColor='#A2A2A2'>File successfully uploaded</Text>
                                </Box>) : 
                                (<></>)}
                                <Box h='100%' w='100%' justifyContent='center' alignItems='center' position='relative' display='flex'>
                                    {generating ? (<Spinner boxSize='100px' thickness='10px' speed='1s' color='gray' position='absolute' top='25%'/>) :  
                                    <Button as='label' htmlFor='file' cursor='pointer' _hover={{bg:'none'}} bg='none' onClick={generateStudentList}>
                                        <AddIcon boxSize='100px' color='gray' _hover={{color: 'gray.500'}} transform='translate(0%, -50%)'/>
                                    </Button>}
                                </Box>
                            </Box>
                        </Flex>
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
        )
    }
    
    export default StudentOverlay;