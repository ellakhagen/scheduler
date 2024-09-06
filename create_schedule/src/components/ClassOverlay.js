import {Box, Button, Text, Drawer, DrawerBody, Input, useToast,
DrawerHeader, DrawerOverlay, DrawerContent, Flex, NumberInput, NumberInputField, 
NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper, 
Select, Spinner, useDisclosure} from '@chakra-ui/react'
import ConfirmClasses from '../components/ConfirmClasses';
import {AddIcon} from '@chakra-ui/icons'
import {useState} from 'react'


function ClassOverlay({isOpen, onClose, classFile, setClasses, 
    setClassFile, generatedClassFile, setGeneratedClassFile, email, 
    password, setTerm, term, yourClasses, setYourClasses, headless}){
    const [generating, setGenerating] = useState(false);
    const [session, setSession] = useState('')
    const [type, setType] = useState('')
    const [year, setYear] = useState(new Date().getFullYear());
    const {isOpen: isOpenConfirm, onOpen: onOpenConfirm, onClose: onCloseConfirm} = useDisclosure()


    const toast = useToast();

    async function generateClassList(){
        setGenerating(true)
        toast({
            title: "Approve action with DUO two factor authentication.",
            status: 'success',
            duration: 9000,
            isClosable: true,
            position: 'bottom',
        })
        console.log(headless)
        console.log(session, type, year)
        const response = await fetch('http://localhost:3001/get_classes', {
            method: 'POST',
            headers:{
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({email, password, session, type, year, headless}),
        });
        console.log(response.status)
        if(response.status === 400){
            toast({
                title: "Option not available for class search",
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
        const isValid = checkFileContent(file)

        if(isValid){
            setTerm(session + " " + type + " " + year)
            const parsedFile = JSON.parse(file)
            setGeneratedClassFile(parsedFile)       
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
        setGenerating(false)

    }


    function handleFileChange(event){
        const file= event.target.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            const fileContent = e.target.result
            const isValid = checkFileContent(fileContent)
            if(isValid){
                const termName = file.name
                setTerm(termName.replace('ClassList.txt', '').replace(/([a-z])([A-Z])/g, '$1 $2')
                .replace(/([A-Za-z])(\d)/g, '$1 $2'))
                const parsed = JSON.parse(fileContent);
                setClassFile(parsed)
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
        onOpenConfirm()
    }

    return(
        <div>
        <Drawer placement='bottom' onClose={onClose} isOpen={isOpen}>
            <DrawerOverlay />
            <DrawerContent p='40px'>
                <DrawerHeader pb='0px' pl='0' display='flex' justifyContent='space-between'>
                    <Text fontSize='30px'>Class Information</Text>
                    {classFile || generatedClassFile ? 
                    (<Button onClick={handleContinue} bg='#ECECEC'>
                        <Text textColor='#626161'>Continue</Text>
                    </Button>) : (<></>)}
                </DrawerHeader>
                <DrawerHeader borderBottomWidth='1px' textColor='#626161' pt='0px' pl='0px'>Generate new class list or upload existing list</DrawerHeader>
                <DrawerBody pl='0px'>
                    <Flex justify="space-between" gap='40px' pt='40px'>
                        <Box flex='1' h='400px' bg='#F4F3F3' boxShadow='base' overflow='hidden' borderRadius='15px'>
                            <Box bg='#ECECEC' p='20px' h='100px'>
                                <Text fontSize='20px' fontFamily='inter' textColor='#626161'>Upload</Text>
                                <Text fontSize='15px' fontFamily='inter' textColor='#A2A2A2'>Should be in format "FallQuarterClassList2024.txt" 
                                if program has been run before.</Text>
                            </Box>
                            {classFile ? 
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
                                <Flex w='50%' justify='space-between' gap='10px'>
                                    <Select placeholder='Session' bg='#F4F3F3' textColor='#A2A2A2' 
                                    color='#A2A2A2' value={session} onChange={(e) => setSession(e.target.value)}>
                                        <option value='Fall'>Fall</option>
                                        <option value='Winter'>Winter</option>
                                        <option value='Spring'>Spring</option>
                                        <option value='Summer'>Summer</option>
                                    </Select>
                                    <Select placeholder='Type' bg='#F4F3F3' textColor='#A2A2A2' 
                                    color='#A2A2A2' value={type} onChange={(e) => setType(e.target.value)}>
                                        <option value='Quarter'>Quarter</option>
                                        <option value='Semester'>Semester</option>
                                    </Select>
                                    <NumberInput defaultValue={new Date().getFullYear()} bg='#F4F3F3' textColor='#A2A2A2' 
                                    value={year} onChange={(valueString) => setYear(parseInt(valueString) || year)}>
                                        <NumberInputField/>
                                        <NumberInputStepper>
                                            <NumberIncrementStepper color='#A2A2A2'/>
                                            <NumberDecrementStepper color='#A2A2A2'/>
                                        </NumberInputStepper>
                                    </NumberInput>
                                </Flex>
                            </Box>
                            {generatedClassFile ? 
                            (<Box w='100%' bg='rgba(91, 145, 90, 0.25)' p ='10px 20px 10px 20px'>
                                <Text fontSize='15px' fontFamily='inter' textColor='#A2A2A2'>File successfully uploaded</Text>
                            </Box>) : 
                            (<></>)}
                            <Box h='100%' w='100%' justifyContent='center' alignItems='center' position='relative' display='flex'>
                                {generating ? (<Spinner boxSize='100px' thickness='10px' speed='1s' color='gray' position='absolute' top='25%'/>) :  
                                <Button as='label' htmlFor='file' cursor='pointer' _hover={{bg:'none'}} bg='none' onClick={generateClassList}>
                                    <AddIcon boxSize='100px' color='gray' _hover={{color: 'gray.500'}} transform='translate(0%, -50%)'/>
                                </Button>}
                            </Box>
                        </Box>
                    </Flex>
                </DrawerBody>
            </DrawerContent>
        </Drawer>
        <ConfirmClasses isOpen={isOpenConfirm} onClose={onCloseConfirm} classFile={classFile}
        setClasses={setClasses} generatedClassFile={generatedClassFile} term={term} 
        yourClasses={yourClasses} setYourClasses={setYourClasses}/>
        </div>
    )
}

export default ClassOverlay;